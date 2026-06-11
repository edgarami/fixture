/**
 * Sube todos los partidos de public/assets/matches.json a Firestore (colección matches).
 * Ejecutar una vez: npm run firebase:seed-matches
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { getFirestore } from './firebase-admin-init.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const matchesPath = join(__dirname, '..', 'public', 'assets', 'matches.json');

const db = getFirestore();
const matches = JSON.parse(readFileSync(matchesPath, 'utf8'));

console.log(`Subiendo ${matches.length} partidos a Firestore...`);

const batchSize = 400;
let minStartMs = Infinity;
for (let i = 0; i < matches.length; i += batchSize) {
    const batch = db.batch();
    const chunk = matches.slice(i, i + batchSize);
    for (const match of chunk) {
        const { id, ...data } = match;
        const ref = db.collection('matches').doc(String(id));
        // startMs: las reglas de seguridad lo usan para bloquear apuestas tardías
        const startMs = new Date(match.time).getTime();
        if (Number.isNaN(startMs)) {
            console.error(`  ✗ Partido ${id} con time inválido: ${match.time}`);
            process.exit(1);
        }
        minStartMs = Math.min(minStartMs, startMs);
        batch.set(
            ref,
            { ...data, startMs, footballDataId: match.footballDataId ?? null },
            { merge: true },
        );
    }
    await batch.commit();
    console.log(`  ${Math.min(i + batchSize, matches.length)} / ${matches.length}`);
}

const bettingDeadlineMs = minStartMs - 10 * 60 * 1000;
await db.collection('config').doc('settings').set({ bettingDeadlineMs }, { merge: true });
console.log(
    `config/settings.bettingDeadlineMs = ${new Date(bettingDeadlineMs).toISOString()}`,
);

console.log('Listo. Publicá firestore.rules y recargá la app.');
