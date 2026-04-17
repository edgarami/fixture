const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const MATCHES_FILE = path.join(DATA_DIR, 'matches.json');

const flagBase = 'https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.3.2/flags/4x3/';

const teamFlags = {
    'México': 'mx.svg',
    'Sudáfrica': 'za.svg',
    'Corea del Sur': 'kr.svg',
    'UEFA 4': 'eu.svg',
    'Canadá': 'ca.svg',
    'UEFA 1': 'eu.svg',
    'Qatar': 'qa.svg',
    'Suiza': 'ch.svg',
    'Brasil': 'br.svg',
    'Marruecos': 'ma.svg',
    'Haití': 'ht.svg',
    'Escocia': 'gb-sct.svg',
    'Estados Unidos': 'us.svg',
    'Paraguay': 'py.svg',
    'Australia': 'au.svg',
    'UEFA 3': 'eu.svg',
    'Alemania': 'de.svg',
    'Curazao': 'cw.svg',
    'Costa de Marfil': 'ci.svg',
    'Ecuador': 'ec.svg',
    'Países Bajos': 'nl.svg',
    'Japón': 'jp.svg',
    'UEFA 2': 'eu.svg',
    'Túnez': 'tn.svg',
    'Bélgica': 'be.svg',
    'Egipto': 'eg.svg',
    'Irán': 'ir.svg',
    'Nueva Zelanda': 'nz.svg',
    'España': 'es.svg',
    'Cabo Verde': 'cv.svg',
    'Arabia Saudita': 'sa.svg',
    'Uruguay': 'uy.svg',
    'Francia': 'fr.svg',
    'Senegal': 'sn.svg',
    'Internacional 2': 'un.svg',
    'Noruega': 'no.svg',
    'Argentina': 'ar.svg',
    'Argelia': 'dz.svg',
    'Austria': 'at.svg',
    'Jordania': 'jo.svg',
    'Portugal': 'pt.svg',
    'Internacional 1': 'un.svg',
    'Uzbekistán': 'uz.svg',
    'Colombia': 'co.svg',
    'Inglaterra': 'gb-eng.svg',
    'Croacia': 'hr.svg',
    'Ghana': 'gh.svg',
    'Panamá': 'pa.svg'
};

const stadiumMap = {
    'Estadio Ciudad de México': 'Estadio Azteca, Mexico City',
    'Estadio Guadalajara': 'Estadio Akron, Guadalajara',
    'Estadio Toronto': 'BMO Field, Toronto',
    'Estadio Los Ángeles': 'SoFi Stadium, Los Angeles',
    'Estadio Bahía de San Francisco': 'Levi\'s Stadium, San Francisco',
    'Estadio Nueva York Nueva Jersey': 'MetLife Stadium, NY/NJ',
    'Estadio Boston': 'Gillette Stadium, Boston',
    'Estadio BC Place Vancouver': 'BC Place, Vancouver',
    'Estadio Houston': 'NRG Stadium, Houston',
    'Estadio Dallas': 'AT&T Stadium, Dallas',
    'Estadio Filadelfia': 'Lincoln Financial Field, Philadelphia',
    'Estadio Monterrey': 'Estadio BBVA, Monterrey',
    'Estadio Atlanta': 'Mercedes-Benz Stadium, Atlanta',
    'Estadio Seattle': 'Lumen Field, Seattle',
    'Estadio Miami': 'Hard Rock Stadium, Miami',
    'Estadio Kansas City': 'Arrowhead Stadium, Kansas City'
};

const rawMatchData = [
    // 11 Jun
    { date: '2026-06-11', time: '15:00', t1: 'México', t2: 'Sudáfrica', grp: 'Grupo A', ven: 'Estadio Ciudad de México' },
    { date: '2026-06-11', time: '22:00', t1: 'Corea del Sur', t2: 'UEFA 4', grp: 'Grupo A', ven: 'Estadio Guadalajara' },
    // 12 Jun
    { date: '2026-06-12', time: '15:00', t1: 'Canadá', t2: 'UEFA 1', grp: 'Grupo B', ven: 'Estadio Toronto' },
    { date: '2026-06-12', time: '21:00', t1: 'Estados Unidos', t2: 'Paraguay', grp: 'Grupo D', ven: 'Estadio Los Ángeles' },
    // 13 Jun
    { date: '2026-06-13', time: '15:00', t1: 'Qatar', t2: 'Suiza', grp: 'Grupo B', ven: 'Estadio Bahía de San Francisco' },
    { date: '2026-06-13', time: '18:00', t1: 'Brasil', t2: 'Marruecos', grp: 'Grupo C', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-06-13', time: '21:00', t1: 'Haití', t2: 'Escocia', grp: 'Grupo C', ven: 'Estadio Boston' },
    { date: '2026-06-14', time: '01:00', t1: 'Australia', t2: 'UEFA 3', grp: 'Grupo D', ven: 'Estadio BC Place Vancouver' },
    // 14 Jun
    { date: '2026-06-14', time: '13:00', t1: 'Alemania', t2: 'Curazao', grp: 'Grupo E', ven: 'Estadio Houston' },
    { date: '2026-06-14', time: '16:00', t1: 'Países Bajos', t2: 'Japón', grp: 'Grupo F', ven: 'Estadio Dallas' },
    { date: '2026-06-14', time: '19:00', t1: 'Costa de Marfil', t2: 'Ecuador', grp: 'Grupo E', ven: 'Estadio Filadelfia' },
    { date: '2026-06-14', time: '22:00', t1: 'UEFA 2', t2: 'Túnez', grp: 'Grupo F', ven: 'Estadio Monterrey' },
    // 15 Jun
    { date: '2026-06-15', time: '12:00', t1: 'España', t2: 'Cabo Verde', grp: 'Grupo H', ven: 'Estadio Atlanta' },
    { date: '2026-06-15', time: '15:00', t1: 'Bélgica', t2: 'Egipto', grp: 'Grupo G', ven: 'Estadio Seattle' },
    { date: '2026-06-15', time: '18:00', t1: 'Arabia Saudita', t2: 'Uruguay', grp: 'Grupo H', ven: 'Estadio Miami' },
    { date: '2026-06-15', time: '21:00', t1: 'Irán', t2: 'Nueva Zelanda', grp: 'Grupo G', ven: 'Estadio Los Ángeles' },
    // 16 Jun
    { date: '2026-06-16', time: '15:00', t1: 'Francia', t2: 'Senegal', grp: 'Grupo I', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-06-16', time: '18:00', t1: 'Internacional 2', t2: 'Noruega', grp: 'Grupo I', ven: 'Estadio Boston' },
    { date: '2026-06-16', time: '21:00', t1: 'Argentina', t2: 'Argelia', grp: 'Grupo J', ven: 'Estadio Kansas City' },
    { date: '2026-06-20', time: '01:00', t1: 'Austria', t2: 'Jordania', grp: 'Grupo J', ven: 'Estadio Bahía de San Francisco' },
    // 17 Jun
    { date: '2026-06-17', time: '13:00', t1: 'Portugal', t2: 'Internacional 1', grp: 'Grupo K', ven: 'Estadio Houston' },
    { date: '2026-06-17', time: '16:00', t1: 'Inglaterra', t2: 'Croacia', grp: 'Grupo L', ven: 'Estadio Dallas' },
    { date: '2026-06-17', time: '19:00', t1: 'Ghana', t2: 'Panamá', grp: 'Grupo L', ven: 'Estadio Toronto' },
    { date: '2026-06-17', time: '22:00', t1: 'Uzbekistán', t2: 'Colombia', grp: 'Grupo K', ven: 'Estadio Ciudad de México' },
    // 18 Jun
    { date: '2026-06-18', time: '12:00', t1: 'UEFA 4', t2: 'Sudáfrica', grp: 'Grupo A', ven: 'Estadio Atlanta' },
    { date: '2026-06-18', time: '15:00', t1: 'Suiza', t2: 'UEFA 1', grp: 'Grupo B', ven: 'Estadio Los Ángeles' },
    { date: '2026-06-18', time: '18:00', t1: 'Canadá', t2: 'Qatar', grp: 'Grupo B', ven: 'Estadio BC Place Vancouver' },
    { date: '2026-06-18', time: '21:00', t1: 'México', t2: 'Corea del Sur', grp: 'Grupo A', ven: 'Estadio Guadalajara' },
    // 19 Jun
    { date: '2026-06-19', time: '15:00', t1: 'Estados Unidos', t2: 'Australia', grp: 'Grupo D', ven: 'Estadio Seattle' },
    { date: '2026-06-19', time: '18:00', t1: 'Escocia', t2: 'Marruecos', grp: 'Grupo C', ven: 'Estadio Boston' },
    { date: '2026-06-19', time: '21:00', t1: 'Brasil', t2: 'Haití', grp: 'Grupo C', ven: 'Estadio Filadelfia' },
    { date: '2026-06-19', time: '00:00', t1: 'UEFA 3', t2: 'Paraguay', grp: 'Grupo D', ven: 'Estadio Bahía de San Francisco' },
    // 20 Jun
    { date: '2026-06-20', time: '13:00', t1: 'Países Bajos', t2: 'UEFA 2', grp: 'Grupo F', ven: 'Estadio Houston' },
    { date: '2026-06-20', time: '16:00', t1: 'Alemania', t2: 'Costa de Marfil', grp: 'Grupo E', ven: 'Estadio Toronto' },
    { date: '2026-06-20', time: '22:00', t1: 'Ecuador', t2: 'Curazao', grp: 'Grupo E', ven: 'Estadio Kansas City' },
    { date: '2026-06-20', time: '00:00', t1: 'Túnez', t2: 'Japón', grp: 'Grupo F', ven: 'Estadio Monterrey' },
    // 21 Jun
    { date: '2026-06-21', time: '12:00', t1: 'España', t2: 'Arabia Saudita', grp: 'Grupo H', ven: 'Estadio Atlanta' },
    { date: '2026-06-21', time: '15:00', t1: 'Bélgica', t2: 'Irán', grp: 'Grupo G', ven: 'Estadio Los Ángeles' },
    { date: '2026-06-21', time: '18:00', t1: 'Uruguay', t2: 'Cabo Verde', grp: 'Grupo H', ven: 'Estadio Miami' },
    { date: '2026-06-21', time: '21:00', t1: 'Nueva Zelanda', t2: 'Egipto', grp: 'Grupo G', ven: 'Estadio BC Place Vancouver' },
    // 22 Jun
    { date: '2026-06-22', time: '13:00', t1: 'Argentina', t2: 'Austria', grp: 'Grupo J', ven: 'Estadio Dallas' },
    { date: '2026-06-22', time: '17:00', t1: 'Francia', t2: 'Internacional 2', grp: 'Grupo I', ven: 'Estadio Filadelfia' },
    { date: '2026-06-22', time: '20:00', t1: 'Noruega', t2: 'Senegal', grp: 'Grupo I', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-06-22', time: '23:00', t1: 'Jordania', t2: 'Argelia', grp: 'Grupo J', ven: 'Estadio Bahía de San Francisco' },
    // 23 Jun
    { date: '2026-06-23', time: '13:00', t1: 'Portugal', t2: 'Uzbekistán', grp: 'Grupo K', ven: 'Estadio Houston' },
    { date: '2026-06-23', time: '16:00', t1: 'Inglaterra', t2: 'Ghana', grp: 'Grupo L', ven: 'Estadio Boston' },
    { date: '2026-06-23', time: '19:00', t1: 'Panamá', t2: 'Croacia', grp: 'Grupo L', ven: 'Estadio Toronto' },
    { date: '2026-06-23', time: '22:00', t1: 'Colombia', t2: 'Internacional 1', grp: 'Grupo K', ven: 'Estadio Guadalajara' },
    // 24 Jun
    { date: '2026-06-24', time: '15:00', t1: 'Suiza', t2: 'Canadá', grp: 'Grupo B', ven: 'Estadio BC Place Vancouver' },
    { date: '2026-06-24', time: '15:00', t1: 'UEFA 1', t2: 'Qatar', grp: 'Grupo B', ven: 'Estadio Seattle' },
    { date: '2026-06-24', time: '18:00', t1: 'Escocia', t2: 'Brasil', grp: 'Grupo C', ven: 'Estadio Miami' },
    { date: '2026-06-24', time: '18:00', t1: 'Marruecos', t2: 'Haití', grp: 'Grupo C', ven: 'Estadio Atlanta' },
    { date: '2026-06-24', time: '21:00', t1: 'UEFA 4', t2: 'México', grp: 'Grupo A', ven: 'Estadio Ciudad de México' },
    { date: '2026-06-24', time: '21:00', t1: 'Sudáfrica', t2: 'Corea del Sur', grp: 'Grupo A', ven: 'Estadio Monterrey' },
    // 25 Jun
    { date: '2026-06-25', time: '16:00', t1: 'Curazao', t2: 'Costa de Marfil', grp: 'Grupo E', ven: 'Estadio Filadelfia' },
    { date: '2026-06-25', time: '16:00', t1: 'Ecuador', t2: 'Alemania', grp: 'Grupo E', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-06-25', time: '19:00', t1: 'Japón', t2: 'UEFA 2', grp: 'Grupo F', ven: 'Estadio Dallas' },
    { date: '2026-06-25', time: '19:00', t1: 'Túnez', t2: 'Países Bajos', grp: 'Grupo F', ven: 'Estadio Kansas City' },
    { date: '2026-06-25', time: '22:00', t1: 'UEFA 3', t2: 'Estados Unidos', grp: 'Grupo D', ven: 'Estadio Los Ángeles' },
    { date: '2026-06-25', time: '22:00', t1: 'Paraguay', t2: 'Australia', grp: 'Grupo D', ven: 'Estadio Bahía de San Francisco' },
    // 26 Jun
    { date: '2026-06-26', time: '15:00', t1: 'Noruega', t2: 'Francia', grp: 'Grupo I', ven: 'Estadio Boston' },
    { date: '2026-06-26', time: '15:00', t1: 'Senegal', t2: 'Internacional 2', grp: 'Grupo I', ven: 'Estadio Toronto' },
    { date: '2026-06-26', time: '20:00', t1: 'Cabo Verde', t2: 'Arabia Saudita', grp: 'Grupo H', ven: 'Estadio Houston' },
    { date: '2026-06-26', time: '20:00', t1: 'Uruguay', t2: 'España', grp: 'Grupo H', ven: 'Estadio Guadalajara' },
    { date: '2026-06-26', time: '23:00', t1: 'Egipto', t2: 'Irán', grp: 'Grupo G', ven: 'Estadio Seattle' },
    { date: '2026-06-26', time: '23:00', t1: 'Nueva Zelanda', t2: 'Bélgica', grp: 'Grupo G', ven: 'Estadio BC Place Vancouver' },
    // 27 Jun
    { date: '2026-06-27', time: '17:00', t1: 'Panamá', t2: 'Inglaterra', grp: 'Grupo L', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-06-27', time: '17:00', t1: 'Croacia', t2: 'Ghana', grp: 'Grupo L', ven: 'Estadio Filadelfia' },
    { date: '2026-06-27', time: '19:30', t1: 'Colombia', t2: 'Portugal', grp: 'Grupo K', ven: 'Estadio Miami' },
    { date: '2026-06-27', time: '19:30', t1: 'Internacional 1', t2: 'Uzbekistán', grp: 'Grupo K', ven: 'Estadio Atlanta' },
    { date: '2026-06-27', time: '22:00', t1: 'Argelia', t2: 'Austria', grp: 'Grupo J', ven: 'Estadio Kansas City' },
    { date: '2026-06-27', time: '22:00', t1: 'Jordania', t2: 'Argentina', grp: 'Grupo J', ven: 'Estadio Dallas' },

    // 28 Jun (Dieciseisavos)
    { date: '2026-06-28', time: '16:00', t1: '2º Grupo A', t2: '2º Grupo B', grp: 'Dieciseisavos', ven: 'Estadio Los Ángeles' },
    // 29 Jun
    { date: '2026-06-29', time: '13:00', t1: '1º Grupo E', t2: '3º Grupo A/B/C/D/F', grp: 'Dieciseisavos', ven: 'Estadio Boston' },
    { date: '2026-06-29', time: '15:30', t1: '1º Grupo F', t2: '2º Grupo C', grp: 'Dieciseisavos', ven: 'Estadio Monterrey' },
    { date: '2026-06-29', time: '21:00', t1: '1º Grupo C', t2: '3º Grupo F/G/H/I/J', grp: 'Dieciseisavos', ven: 'Estadio Houston' },
    // 30 Jun
    { date: '2026-06-30', time: '13:00', t1: '1º Grupo I', t2: '3º Grupo C/D/F/G/H', grp: 'Dieciseisavos', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-06-30', time: '17:00', t1: '2º Grupo E', t2: '2º Grupo I', grp: 'Dieciseisavos', ven: 'Estadio Dallas' },
    { date: '2026-06-30', time: '21:00', t1: '1º Grupo A', t2: '3º Grupo C/E/F/H/I', grp: 'Dieciseisavos', ven: 'Estadio Ciudad de México' },
    // 1 Jul
    { date: '2026-07-01', time: '12:00', t1: '1º Grupo L', t2: '3º Grupo E/H/I/J/K', grp: 'Dieciseisavos', ven: 'Estadio Atlanta' },
    { date: '2026-07-01', time: '13:00', t1: '1º Grupo D', t2: '3º Grupo B/E/F/I/J', grp: 'Dieciseisavos', ven: 'Estadio Bahía de San Francisco' },
    { date: '2026-07-01', time: '17:00', t1: '1º Grupo G', t2: '3º Grupo A/E/H/I/J', grp: 'Dieciseisavos', ven: 'Estadio Seattle' },
    // 2 Jul
    { date: '2026-07-02', time: '14:00', t1: '2º Grupo K', t2: '2º Grupo L', grp: 'Dieciseisavos', ven: 'Estadio Toronto' },
    { date: '2026-07-02', time: '18:00', t1: '1º Grupo H', t2: '2º Grupo J', grp: 'Dieciseisavos', ven: 'Estadio Los Ángeles' },
    { date: '2026-07-02', time: '19:30', t1: '1º Grupo B', t2: '3º Grupo E/F/G/I/J', grp: 'Dieciseisavos', ven: 'Estadio BC Place Vancouver' },
    { date: '2026-07-02', time: '22:00', t1: '1º Grupo J', t2: '2º Grupo H', grp: 'Dieciseisavos', ven: 'Estadio Miami' },
    // 3 Jul
    { date: '2026-07-03', time: '14:00', t1: '1º Grupo K', t2: '3º Grupo D/E/I/J/L', grp: 'Dieciseisavos', ven: 'Estadio Kansas City' },
    { date: '2026-07-03', time: '18:00', t1: '2º Grupo D', t2: '2º Grupo G', grp: 'Dieciseisavos', ven: 'Estadio Dallas' },

    // Octavos de final
    { date: '2026-07-04', time: '13:00', t1: 'Ganador 74', t2: 'Ganador 77', grp: 'Octavos', ven: 'Estadio Filadelfia' },
    { date: '2026-07-04', time: '17:00', t1: 'Ganador 73', t2: 'Ganador 75', grp: 'Octavos', ven: 'Estadio Houston' },
    { date: '2026-07-05', time: '16:00', t1: 'Ganador 76', t2: 'Ganador 78', grp: 'Octavos', ven: 'Estadio Nueva York Nueva Jersey' },
    { date: '2026-07-05', time: '20:00', t1: 'Ganador 79', t2: 'Ganador 80', grp: 'Octavos', ven: 'Estadio Ciudad de México' },
    { date: '2026-07-06', time: '15:00', t1: 'Ganador 83', t2: 'Ganador 84', grp: 'Octavos', ven: 'Estadio Dallas' },
    { date: '2026-07-06', time: '17:00', t1: 'Ganador 81', t2: 'Ganador 82', grp: 'Octavos', ven: 'Estadio Seattle' },
    { date: '2026-07-07', time: '12:00', t1: 'Ganador 86', t2: 'Ganador 88', grp: 'Octavos', ven: 'Estadio Atlanta' },
    { date: '2026-07-07', time: '13:00', t1: 'Ganador 85', t2: 'Ganador 87', grp: 'Octavos', ven: 'Estadio BC Place Vancouver' },

    // Cuartos de final
    { date: '2026-07-09', time: '16:00', t1: 'Ganador 89', t2: 'Ganador 90', grp: 'Cuartos', ven: 'Estadio Boston' },
    { date: '2026-07-10', time: '14:00', t1: 'Ganador 93', t2: 'Ganador 94', grp: 'Cuartos', ven: 'Estadio Los Ángeles' },
    { date: '2026-07-11', time: '17:00', t1: 'Ganador 91', t2: 'Ganador 92', grp: 'Cuartos', ven: 'Estadio Miami' },
    { date: '2026-07-11', time: '20:00', t1: 'Ganador 95', t2: 'Ganador 96', grp: 'Cuartos', ven: 'Estadio Kansas City' },

    // Semifinales
    { date: '2026-07-14', time: '15:00', t1: 'Ganador 97', t2: 'Ganador 98', grp: 'Semifinal', ven: 'Estadio Dallas' },
    { date: '2026-07-15', time: '15:00', t1: 'Ganador 99', t2: 'Ganador 100', grp: 'Semifinal', ven: 'Estadio Atlanta' },

    // Tercer puesto
    { date: '2026-07-18', time: '17:00', t1: 'Perdedor 101', t2: 'Perdedor 102', grp: 'Tercer Puesto', ven: 'Estadio Miami' },

    // Final
    { date: '2026-07-19', time: '15:00', t1: 'Ganador 101', t2: 'Ganador 102', grp: 'Final', ven: 'Estadio Nueva York Nueva Jersey' }
];

const games = [];
let matchId = 1;

rawMatchData.forEach(m => {
    const dateTime = new Date(`${m.date}T${m.time}:00Z`).toISOString();
    games.push({
        id: matchId.toString(),
        time: dateTime,
        team1: m.t1,
        team1Flag: flagBase + (teamFlags[m.t1] || 'un.svg'),
        team2: m.t2,
        team2Flag: flagBase + (teamFlags[m.t2] || 'un.svg'),
        score1: null,
        score2: null,
        venue: stadiumMap[m.ven] || m.ven,
        isFinished: false,
        group: m.grp
    });
    matchId++;
});

// Knockouts explicitly defined above in rawMatchData. 
// Match IDs continue automatically through the loop.

fs.writeFileSync(MATCHES_FILE, JSON.stringify(games, null, 2));
console.log(`[SEEDER] Generated ${games.length} matches with OFFICIAL schedule.`);
