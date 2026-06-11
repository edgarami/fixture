/**
 * Agrega startMs (epoch ms del inicio) a cada partido en Firestore y crea
 * config/settings.bettingDeadlineMs (10 min antes del primer partido).
 * Las reglas de seguridad usan estos campos para validar deadlines en el servidor.
 *
 * Uso: npm run firebase:backfill-deadlines
 */
import { getFirestore } from './firebase-admin-init.mjs';

const db = getFirestore();

function toMs(raw) {
    if (!raw) {
        return null;
    }
    if (typeof raw === 'object' && typeof raw.toDate === 'function') {
        return raw.toDate().getTime();
    }
    if (typeof raw === 'object' && typeof raw.seconds === 'number') {
        return raw.seconds * 1000;
    }
    const ms = new Date(String(raw)).getTime();
    return Number.isNaN(ms) ? null : ms;
}

const snap = await db.collection('matches').get();
if (snap.empty) {
    console.error('Firestore no tiene partidos. Ejecutá primero: npm run firebase:seed-matches');
    process.exit(1);
}

let updated = 0;
let skipped = 0;
let invalid = 0;
let minStartMs = Infinity;

const batch = db.batch();
for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const ms = toMs(data.time);
    if (ms === null) {
        console.warn(`  ✗ ${docSnap.id}: time inválido (${data.time})`);
        invalid++;
        continue;
    }
    minStartMs = Math.min(minStartMs, ms);
    if (data.startMs === ms) {
        skipped++;
        continue;
    }
    batch.set(docSnap.ref, { startMs: ms }, { merge: true });
    updated++;
}
await batch.commit();

const bettingDeadlineMs = minStartMs - 10 * 60 * 1000;
await db.collection('config').doc('settings').set({ bettingDeadlineMs }, { merge: true });

console.log(`Partidos: ${snap.size} | startMs escritos: ${updated} | ya correctos: ${skipped} | inválidos: ${invalid}`);
console.log(
    `config/settings.bettingDeadlineMs = ${bettingDeadlineMs} (${new Date(bettingDeadlineMs).toISOString()})`,
);
if (invalid > 0) {
    console.error('Hay partidos con time inválido: las reglas bloquearán apuestas sobre ellos.');
    process.exit(1);
}
console.log('Listo. Ahora publicá firestore.rules (firebase deploy --only firestore:rules).');
