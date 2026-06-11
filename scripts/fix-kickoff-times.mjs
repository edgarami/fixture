/**
 * Corrige los horarios del fixture tomándolos de football-data.org:
 *   - Partidos con equipos reales y vínculo validado por nombre: time/startMs desde la API.
 *   - Partidos con equipos placeholder ("Ganador X"): toma el horario de la API como
 *     estimación pero limpia footballDataId (el vínculo no se puede validar por nombre;
 *     se re-vincula solo cuando se definan los equipos reales).
 * Actualiza también public/assets/matches.json (fallback) y el deadline global.
 *
 * Uso: node scripts/fix-kickoff-times.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { getFirestore } from './firebase-admin-init.mjs';
import { loadLocalEnv } from './load-local-env.mjs';
import { loadTeamMap, teamsPairMatch } from './team-name-utils.mjs';

loadLocalEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const teamMap = loadTeamMap();

const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const COMPETITION = process.env.FOOTBALL_COMPETITION_CODE || 'WC';

if (!API_KEY) {
    console.error('Falta FOOTBALL_DATA_API_KEY (scripts/local-secrets.env)');
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
const locals = snap.docs.map((d) => ({ ref: d.ref, id: d.id, ...d.data() }));

let fixedReal = 0;
let fixedPlaceholder = 0;
let badLinks = 0;
let untouched = 0;
const newTimesById = new Map();

const batch = db.batch();
for (const local of locals) {
    const api = local.footballDataId ? apiById.get(local.footballDataId) : null;
    if (!api) {
        untouched++;
        continue;
    }

    const apiTime = new Date(api.utcDate).toISOString();
    const apiMs = new Date(api.utcDate).getTime();
    const placeholder = isPlaceholderTeam(local.team1) || isPlaceholderTeam(local.team2);

    if (placeholder) {
        // Vínculo no verificable: usar horario de la API como estimación y soltar el ID
        batch.set(
            local.ref,
            { time: apiTime, startMs: apiMs, footballDataId: admin.firestore.FieldValue.delete() },
            { merge: true },
        );
        newTimesById.set(local.id, apiTime);
        fixedPlaceholder++;
        continue;
    }

    const home = api.homeTeam?.name || api.homeTeam?.shortName || '';
    const away = api.awayTeam?.name || api.awayTeam?.shortName || '';
    if (!teamsPairMatch(home, away, local.team1, local.team2, teamMap)) {
        // El vínculo no coincide por nombre: soltarlo para que se re-vincule bien
        console.warn(
            `  ✗ Vínculo dudoso #${local.id} ${local.team1} vs ${local.team2} ↔ API ${home} vs ${away} — se limpia`,
        );
        batch.set(
            local.ref,
            { footballDataId: admin.firestore.FieldValue.delete() },
            { merge: true },
        );
        badLinks++;
        continue;
    }

    if (new Date(local.time).getTime() !== apiMs) {
        batch.set(local.ref, { time: apiTime, startMs: apiMs }, { merge: true });
        newTimesById.set(local.id, apiTime);
    }
    fixedReal++;
}
await batch.commit();

// Recalcular deadline global con los horarios corregidos
const after = await db.collection('matches').get();
let minStartMs = Infinity;
for (const d of after.docs) {
    const ms = d.data().startMs;
    if (typeof ms === 'number') {
        minStartMs = Math.min(minStartMs, ms);
    }
}
const bettingDeadlineMs = minStartMs - 10 * 60 * 1000;
await db.collection('config').doc('settings').set({ bettingDeadlineMs }, { merge: true });

// Mantener el fallback estático consistente
const jsonPath = join(__dirname, '..', 'public', 'assets', 'matches.json');
const matchesJson = JSON.parse(readFileSync(jsonPath, 'utf8'));
let jsonUpdated = 0;
for (const m of matchesJson) {
    const t = newTimesById.get(String(m.id));
    if (t) {
        m.time = t;
        jsonUpdated++;
    }
}
writeFileSync(jsonPath, JSON.stringify(matchesJson, null, 2) + '\n', 'utf8');

console.log(`\nPartidos con equipos reales corregidos/verificados: ${fixedReal}`);
console.log(`Placeholders: horario actualizado y vínculo limpiado: ${fixedPlaceholder}`);
console.log(`Vínculos dudosos limpiados: ${badLinks}`);
console.log(`Sin vínculo (no tocados): ${untouched}`);
console.log(`matches.json: ${jsonUpdated} horarios actualizados`);
console.log(
    `Nuevo deadline global: ${new Date(bettingDeadlineMs).toISOString()} (${new Date(
        bettingDeadlineMs,
    ).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })} AR)`,
);
