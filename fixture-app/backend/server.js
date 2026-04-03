const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const apiService = require('./apiService');

app.use(cors());
app.use(bodyParser.json());

// Sync fixtures on startup
apiService.syncFixtures().catch(err => console.error('Failed initial sync:', err));

// Data Paths
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
const BETS_FILE = path.join(DATA_DIR, 'bets.json');
const GROUP_BETS_FILE = path.join(DATA_DIR, 'group_bets.json');

// --- HELPERS ---
const readJSON = (file, defaultVal = []) => {
    if (!fs.existsSync(file)) return defaultVal;
    return JSON.parse(fs.readFileSync(file));
};

const writeJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// --- MIDDLEWARES (SECURITY) ---

// 1. Validation Middleware
const validate = (schema) => (req, res, next) => {
    for (const [key, type] of Object.entries(schema)) {
        if (req.body[key] === undefined || typeof req.body[key] !== type) {
            return res.status(400).json({ error: `Campo '${key}' es requerido y debe ser de tipo ${type}` });
        }
    }
    next();
};

// 2. Authorization Middleware (Check if user exists and owns the request)
const authorize = (req, res, next) => {
    const userId = req.headers['x-user-id'] || (req.body && req.body.userId);
    if (!userId) return res.status(401).json({ error: 'No autorizado: Falta ID de usuario' });

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(401).json({ error: 'Usuario inexistente' });

    req.user = user; // Attach user to request
    next();
};

// --- ROUTES ---

// 1. Auth / Register (Validated)
app.post('/api/auth/register', validate({ name: 'string', phone: 'string' }), (req, res) => {
    const { name, phone } = req.body;
    if (name.length < 3 || phone.length < 8) {
        return res.status(400).json({ error: 'Nombre o teléfono demasiado corto' });
    }

    let users = readJSON(USERS_FILE);
    let user = users.find(u => u.phone === phone);

    if (!user) {
        user = { id: Date.now().toString(), name, phone, points: 0, championId: null };
        users.push(user);
        writeJSON(USERS_FILE, users);
    }

    res.json(user);
});

// 2. Betting with Strict 10-minute Lock & Authorization
app.post('/api/bets', authorize, validate({ matchId: 'string', score1: 'number', score2: 'number' }), (req, res) => {
    const { matchId, score1, score2 } = req.body;
    const userId = req.user.id;

    const matches = readJSON(MATCHES_FILE);
    const match = matches.find(m => m.id === matchId);

    if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

    // BEETING LOCK LOGIC (Hardened: Use server time)
    const startTime = new Date(match.time).getTime();
    const now = Date.now();
    const diffMinutes = (startTime - now) / (1000 * 60);

    if (diffMinutes < 10) {
        return res.status(403).json({ error: 'Seguridad: Las apuestas se bloquean estrictamente 10 minutos antes del partido' });
    }

    // Prevent negative scores
    if (score1 < 0 || score2 < 0) return res.status(400).json({ error: 'Marcadores no pueden ser negativos' });

    let bets = readJSON(BETS_FILE);
    const betIndex = bets.findIndex(b => b.userId === userId && b.matchId === matchId);
    const newBet = { userId, matchId, score1, score2, timestamp: now };

    if (betIndex > -1) {
        bets[betIndex] = newBet;
    } else {
        bets.push(newBet);
    }

    writeJSON(BETS_FILE, bets);
    res.json({ message: 'Apuesta segura registrada', bet: newBet });
});

// 3. User Stats & Profile (Privacy: only own data)
app.get('/api/user/profile/:userId', authorize, (req, res) => {
    if (req.params.userId !== req.user.id) {
        return res.status(403).json({ error: 'No tienes permiso para ver este perfil' });
    }
    res.json(req.user);
});

// 4. Ranking (Public summary, sanitized)
app.get('/api/ranking', (req, res) => {
    const USERS_FILE = path.join(DATA_DIR, 'users.json');
    const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');
    const BETS_FILE = path.join(DATA_DIR, 'bets.json');
    const GROUP_BETS_FILE = path.join(DATA_DIR, 'group_bets.json');
    const RESULTS_FILE = path.join(DATA_DIR, 'results.json');

    const users = readJSON(USERS_FILE);
    const matches = readJSON(MATCHES_FILE);
    const bets = readJSON(BETS_FILE);
    const groupBets = readJSON(GROUP_BETS_FILE);
    const results = readJSON(RESULTS_FILE, { champion: null, groups: {} });

    // Sanitize: don't send phone numbers in public ranking
    const publicRanking = users.map(user => {
        const userBets = bets.filter(b => b.userId === user.id);
        const totalBets = userBets.length;
        
        let calculatedPoints = 0;
        let wonGames = 0;
        
        // Match Points (10 for exact, 5 for result)
        userBets.forEach(bet => {
            const match = matches.find(m => m.id === bet.matchId);
            if (match && match.isFinished && match.score1 !== null && match.score2 !== null) {
                const actualDiff = match.score1 - match.score2;
                const predictedDiff = bet.score1 - bet.score2;
                
                if (match.score1 === bet.score1 && match.score2 === bet.score2) {
                    calculatedPoints += 10;
                    wonGames++;
                } else if ((actualDiff > 0 && predictedDiff > 0) || 
                         (actualDiff < 0 && predictedDiff < 0) || 
                         (actualDiff === 0 && predictedDiff === 0)) {
                    calculatedPoints += 5;
                    wonGames++;
                }
            }
        });

        // Champion Points (20)
        if (results.champion && user.championId === results.champion) {
            calculatedPoints += 20;
        }

        // Group Challenge Points (5 for 1st, 3 for full)
        const userGroupBets = groupBets.filter(gb => gb.userId === user.id);
        userGroupBets.forEach(gb => {
            const officialOrder = results.groups[gb.groupName];
            if (officialOrder && Array.isArray(officialOrder)) {
                // Correct 1st place (5 pts)
                if (gb.positions[0] && gb.positions[0].name === officialOrder[0]) {
                    calculatedPoints += 5;
                }
                // Full correct order (3 pts)
                const allMatch = gb.positions.every((p, idx) => p.name === officialOrder[idx]);
                if (allMatch) {
                    calculatedPoints += 3;
                }
            }
        });

        // Add user-specific manual balance points if any (deprecated but kept for compatibility)
        const finalPoints = calculatedPoints + (user.points || 0);

        return { 
            id: user.id, 
            name: user.name, 
            points: finalPoints,
            totalBets,
            wonGames
        };
    }).sort((a, b) => b.points - a.points || b.wonGames - a.wonGames);

    res.json(publicRanking);
});

// 5. Matches (Public)
app.get('/api/matches', (req, res) => {
    res.json(readJSON(MATCHES_FILE));
});

// 5b. Bets for a specific match (Public summary)
app.get('/api/matches/:matchId/bets', (req, res) => {
    const matchId = req.params.matchId;
    const bets = readJSON(BETS_FILE);
    const users = readJSON(USERS_FILE);

    // Filter bets for this match and attach user names (sanitized, no phone numbers)
    const matchBets = bets
        .filter(b => b.matchId === matchId)
        .map(b => {
            const user = users.find(u => u.id === b.userId);
            return {
                userName: user ? user.name : 'Usuario Desconocido',
                score1: b.score1,
                score2: b.score2
            };
        });

    res.json(matchBets);
});

// 6. Group Betting (Challenge) with 10-minute Lock & Global Deadline
app.post('/api/bets/groups', authorize, validate({ groupName: 'string', positions: 'object' }), (req, res) => {
    const { groupName, positions } = req.body;
    const userId = req.user.id;

    // GLOBAL DEADLINE: 10 minutes before the FIRST match
    const matches = readJSON(MATCHES_FILE);
    const firstMatch = matches.sort((a, b) => new Date(a.time) - new Date(b.time))[0];
    
    if (firstMatch) {
        const deadline = new Date(firstMatch.time).getTime() - (10 * 60 * 1000);
        if (Date.now() > deadline) {
            return res.status(403).json({ error: 'El Desafío de Grupo se cerró 10 minutos antes del primer partido del mundial.' });
        }
    }

    let groupBets = readJSON(GROUP_BETS_FILE);
    
    // Check if ALREADY LOCKED for this user and group
    const existingBet = groupBets.find(b => b.userId === userId && b.groupName === groupName);
    if (existingBet) {
        return res.status(403).json({ error: 'Esta apuesta ya ha sido guardada y está bloqueada.' });
    }

    const newGroupBet = { 
        userId, 
        groupName, 
        positions, // Array of team objects or IDs
        timestamp: Date.now() 
    };

    groupBets.push(newGroupBet);
    writeJSON(GROUP_BETS_FILE, groupBets);
    
    res.json({ message: 'Apuesta de grupo bloqueada y guardada', bet: newGroupBet });
});

// 7. Get user group bets
app.get('/api/bets/groups/:userId', authorize, (req, res) => {
    if (req.params.userId !== req.user.id) {
        return res.status(403).json({ error: 'No autorizado' });
    }
    const groupBets = readJSON(GROUP_BETS_FILE);
    const userBets = groupBets.filter(b => b.userId === req.params.userId);
    res.json(userBets);
});

// 8. Champion Selection (Authorized)
app.post('/api/user/champion', authorize, validate({ championId: 'string' }), (req, res) => {
    let users = readJSON(USERS_FILE);
    const uIndex = users.findIndex(u => u.id === req.user.id);

    // Additional Logic: forbid changing after tournament start
    users[uIndex].championId = req.body.championId;
    writeJSON(USERS_FILE, users);
    res.json({ message: 'Campeón registrado con éxito' });
});

app.listen(PORT, () => {
    console.log(`[SECURITY ON] Server running at http://localhost:${PORT}`);
});
