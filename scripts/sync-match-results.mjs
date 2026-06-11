/**
 * Obtiene resultados desde football-data.org y actualiza Firestore.
 *
 * Variables de entorno:
 *   FOOTBALL_DATA_API_KEY  — token en https://www.football-data.org/client/register
 *   FOOTBALL_COMPETITION_CODE — ej. WC, WCQ, o el código de tu competición (default: WC)
 *
 * Uso: npm run firebase:sync-results
 */
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getFirestore } from './firebase-admin-init.mjs';
import { loadLocalEnv } from './load-local-env.mjs';
import { apiNameMatchesLocal, loadTeamMap, teamsPairMatch } from './team-name-utils.mjs';

loadLocalEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const teamMap = loadTeamMap();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION = process.env.FOOTBALL_COMPETITION_CODE || 'WC';

if (!API_KEY) {
    console.error(`
Falta FOOTBALL_DATA_API_KEY. Opción A (recomendada en Windows):
  1. Copiá scripts/local-secrets.env.example → scripts/local-secrets.env
  2. Pegá tu token de https://www.football-data.org/client/register
  3. Volvé a ejecutar: npm run firebase:sync-results

Opción B — en la MISMA ventana de PowerShell, antes del comando:
  $env:FOOTBALL_DATA_API_KEY = "tu_token_aqui"
  $env:FOOTBALL_COMPETITION_CODE = "WC"
  npm run firebase:sync-results
`);
    process.exit(1);
}

function isPlaceholderTeam(name) {
    const n = String(name).toLowerCase();
    return (
        n.includes('ganador') ||
        n.includes('perdedor') ||
        n.includes('grupo') ||
        n.startsWith('3º') ||
        n.startsWith('1º') ||
        n.startsWith('2º')
    );
}

function mapStatus(apiStatus) {
    const finished = ['FINISHED', 'AWARDED'];
    const live = ['IN_PLAY', 'PAUSED', 'HALFTIME', 'LIVE'];
    if (finished.includes(apiStatus)) {
        return { isFinished: true, updateScores: true };
    }
    if (live.includes(apiStatus)) {
        return { isFinished: false, updateScores: true };
    }
    return { isFinished: false, updateScores: false };
}

const db = getFirestore();

const url = `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`;
console.log(`Consultando ${url} ...`);

const response = await fetch(url, {
    headers: { 'X-Auth-Token': API_KEY },
});

if (!response.ok) {
    const text = await response.text();
    console.error(`API error ${response.status}:`, text);
    console.error(
        'Si WC no existe en tu plan, probá otro código en FOOTBALL_COMPETITION_CODE',
    );
    process.exit(1);
}

const payload = await response.json();
const apiMatches = payload.matches || [];
console.log(`Partidos en API: ${apiMatches.length}`);

const localSnap = await db.collection('matches').get();
if (localSnap.empty) {
    console.error('Firestore no tiene partidos. Ejecutá primero: npm run firebase:seed-matches');
    process.exit(1);
}

const localMatches = localSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
const totalInFirestore = localMatches.length;
const alreadyLinkedBefore = localMatches.filter((m) => m.footballDataId).length;

const statusCounts = {};
for (const api of apiMatches) {
    statusCounts[api.status] = (statusCounts[api.status] || 0) + 1;
}
console.log('Estados en la API:', statusCounts);

function findLocalForApi(api, locals) {
    const home = api.homeTeam?.name || api.homeTeam?.shortName || '';
    const away = api.awayTeam?.name || api.awayTeam?.shortName || '';

    let local = locals.find((m) => m.footballDataId === api.id);
    if (local) {
        return { local, home, away };
    }

    local = locals.find((m) => {
        if (m.footballDataId && m.footballDataId !== api.id) {
            return false;
        }
        const apiTime = new Date(api.utcDate).getTime();
        const localTime = new Date(m.time).getTime();
        const hoursDiff = Math.abs(apiTime - localTime) / (1000 * 60 * 60);
        if (hoursDiff > 72) {
            return false;
        }
        if (isPlaceholderTeam(m.team1) || isPlaceholderTeam(m.team2)) {
            return false;
        }
        return teamsPairMatch(home, away, m.team1, m.team2, teamMap);
    });

    return local ? { local, home, away } : null;
}

/**
 * teamsPairMatch acepta el emparejamiento con los equipos invertidos
 * (home de la API = team2 local). Detecta esa orientación para no
 * guardar el marcador al revés.
 */
function isSwapped(local, home, away) {
    if (
        apiNameMatchesLocal(home, local.team1, teamMap) &&
        apiNameMatchesLocal(away, local.team2, teamMap)
    ) {
        return false;
    }
    return (
        apiNameMatchesLocal(home, local.team2, teamMap) &&
        apiNameMatchesLocal(away, local.team1, teamMap)
    );
}

let linked = 0;
let updated = 0;
let unmatched = 0;

// Fase 1: vincular ID de API aunque el partido aún no haya empezado
for (const api of apiMatches) {
    const found = findLocalForApi(api, localMatches);
    if (!found) {
        unmatched++;
        continue;
    }
    const { local } = found;
    if (!local.footballDataId) {
        await db.collection('matches').doc(local.id).set(
            { footballDataId: api.id, syncedAt: new Date().toISOString() },
            { merge: true },
        );
        local.footballDataId = api.id;
        linked++;
    }
}

// Fase 2: actualizar marcadores solo si el partido está en juego o terminó
for (const api of apiMatches) {
    const { isFinished, updateScores } = mapStatus(api.status);
    if (!updateScores) {
        continue;
    }

    const homeScore = api.score?.fullTime?.home ?? api.score?.regularTime?.home ?? null;
    const awayScore = api.score?.fullTime?.away ?? api.score?.regularTime?.away ?? null;
    if (homeScore === null || awayScore === null) {
        continue;
    }

    const found = findLocalForApi(api, localMatches);
    if (!found) {
        continue;
    }

    const { local, home, away } = found;
    const swapped = isSwapped(local, home, away);
    const score1 = swapped ? awayScore : homeScore;
    const score2 = swapped ? homeScore : awayScore;

    const penalties = api.score?.penalties;
    let wentToPenalties = false;
    let penaltyWinner = undefined;

    if (penalties?.home != null && penalties?.away != null) {
        wentToPenalties = true;
        if (penalties.home > penalties.away) {
            penaltyWinner = swapped ? 2 : 1;
        } else if (penalties.away > penalties.home) {
            penaltyWinner = swapped ? 1 : 2;
        }
    }

    await db.collection('matches').doc(local.id).set(
        {
            score1,
            score2,
            isFinished,
            footballDataId: api.id,
            syncedAt: new Date().toISOString(),
            ...(wentToPenalties ? { wentToPenalties, penaltyWinner } : {}),
        },
        { merge: true },
    );
    updated++;
    console.log(
        `  ✓ ${local.team1} ${score1}-${score2} ${local.team2} (${api.status})`,
    );
}

const scheduled =
    (statusCounts['TIMED'] || 0) +
    (statusCounts['SCHEDULED'] || 0) +
    (statusCounts['NS'] || 0);

const totalLinkedNow = alreadyLinkedBefore + linked;

console.log('\n--- Resumen ---');
console.log(
    `Total vinculados con API: ${totalLinkedNow} / ${totalInFirestore} (en esta ejecución: +${linked} nuevos)`,
);
console.log(`Marcadores actualizados ahora: ${updated}`);
if (unmatched > 0) {
    console.log(`Partidos de la API sin pareja en tu fixture: ${unmatched}`);
}

if (updated === 0 && totalLinkedNow >= totalInFirestore - 5) {
    console.log(
        '\n✓ Todo en orden: la conexión con la API funciona y los partidos de fase de grupos ya están vinculados.',
    );
    if (scheduled > 0) {
        console.log(
            `Aún no hay marcadores porque ${scheduled} partido(s) están programados (el mundial no empezó o no terminaron).`,
        );
        console.log(
            'Cuando jueguen, volvé a ejecutar npm run firebase:sync-results (o el cron cada 15 min).',
        );
    }
} else if (updated === 0 && linked > 0) {
    console.log(`\n✓ Se vincularon ${linked} partido(s) nuevo(s) en esta ejecución.`);
} else if (unmatched > 0) {
    const placeholders = localMatches.filter(
        (m) => isPlaceholderTeam(m.team1) || isPlaceholderTeam(m.team2),
    ).length;
    console.log(
        `\n${unmatched} partido(s) de la API no se vincularon (a menudo fases finales con "Ganador X" en tu fixture).`,
    );
    if (placeholders > 0) {
        console.log(
            `En Firestore hay ${placeholders} partido(s) con equipos placeholder — se actualizan cuando definas los equipos reales.`,
        );
    }
} else if (totalLinkedNow === 0) {
    console.log(
        '\nNo hay partidos vinculados. Ejecutá npm run firebase:seed-matches y revisá team-name-map.json',
    );
}
