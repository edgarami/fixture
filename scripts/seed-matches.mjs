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
for (let i = 0; i < matches.length; i += batchSize) {
    const batch = db.batch();
    const chunk = matches.slice(i, i + batchSize);
    for (const match of chunk) {
        const { id, ...data } = match;
        const ref = db.collection('matches').doc(String(id));
        batch.set(ref, { ...data, footballDataId: match.footballDataId ?? null }, { merge: true });
    }
    await batch.commit();
    console.log(`  ${Math.min(i + batchSize, matches.length)} / ${matches.length}`);
}

console.log('Listo. Publicá firestore.rules y recargá la app.');
