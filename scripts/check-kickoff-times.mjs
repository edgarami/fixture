/**
 * Compara los horarios de tu fixture en Firestore contra los de
 * football-data.org (vía footballDataId). Solo lee, no modifica nada.
 *
 * Uso: node scripts/check-kickoff-times.mjs
 */
import { getFirestore } from './firebase-admin-init.mjs';
import { loadLocalEnv } from './load-local-env.mjs';

loadLocalEnv();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION = process.env.FOOTBALL_COMPETITION_CODE || 'WC';

if (!API_KEY) {
    console.error('Falta FOOTBALL_DATA_API_KEY (scripts/local-secrets.env)');
    process.exit(1);
}

const db = getFirestore();

const response = await fetch(
    `https://api.football-data.org/v4/competitions/${COMPETITION}/matches`,
    { headers: { 'X-Auth-Token': API_KEY } },
);
if (!response.ok) {
    console.error(`API error ${response.status}:`, await response.text());
    process.exit(1);
}
const apiById = new Map();
for (const m of (await response.json()).matches) {
    apiById.set(m.id, m);
}

const snap = await db.collection('matches').get();
const locals = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((m) => m.footballDataId);

let mismatches = 0;
const fmtAr = (iso) =>
    new Date(iso).toLocaleString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        dateStyle: 'short',
        timeStyle: 'short',
    });

for (const local of locals.sort((a, b) => new Date(a.time) - new Date(b.time))) {
    const api = apiById.get(local.footballDataId);
    if (!api) {
        continue;
    }
    const localMs = new Date(local.time).getTime();
    const apiMs = new Date(api.utcDate).getTime();
    if (localMs !== apiMs) {
        mismatches++;
        const diffH = ((apiMs - localMs) / 3600000).toFixed(1);
        console.log(
            `  #${local.id} ${local.team1} vs ${local.team2}: fixture ${local.time} | API ${api.utcDate} (${fmtAr(api.utcDate)} AR) — dif ${diffH}h`,
        );
    }
}

console.log(`\nVinculados: ${locals.length} | con horario distinto a la API: ${mismatches}`);
