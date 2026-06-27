/**
 * Corrige la fecha de 3 partidos de la última fecha de grupo que estaban
 * desfasados respecto a su partido gemelo (mismo grupo, misma fecha = simultáneos).
 * Actualiza time + startMs en Firestore.
 *
 * Uso: node scripts/fix-shifted-dates.mjs
 */
import { getFirestore } from './firebase-admin-init.mjs';

const fixes = {
    '63': '2026-06-27T00:00:00.000Z', // Cabo Verde vs Arabia Saudita (Grupo H) ↔ #64
    '68': '2026-06-27T21:00:00.000Z', // Croacia vs Ghana (Grupo L) ↔ #67
    '71': '2026-06-28T02:00:00.000Z', // Argelia vs Austria (Grupo J) ↔ #72
};

const db = getFirestore();
const batch = db.batch();

// Escritura a ciegas (merge): sin lecturas previas para minimizar uso de cuota.
for (const [id, time] of Object.entries(fixes)) {
    const ref = db.collection('matches').doc(id);
    const startMs = new Date(time).getTime();
    batch.set(ref, { time, startMs }, { merge: true });
    console.log(`  #${id} -> ${time} (startMs ${startMs})`);
}

await batch.commit();
console.log('Listo. Firestore actualizado.');
process.exit(0);
