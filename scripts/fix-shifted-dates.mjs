/**
 * Corrige fechas/horarios de partidos de eliminatorias que estaban
 * desincronizados respecto al calendario oficial (hora Argentina UTC-3).
 * Alinea cada llave (placeholder) con su fecha real. Actualiza time + startMs.
 *
 * Uso: node scripts/fix-shifted-dates.mjs
 */
import { getFirestore } from './firebase-admin-init.mjs';

// id -> hora UTC oficial (16avos completos + 2 octavos que estaban mal ubicados)
const fixes = {
    '73': '2026-06-28T19:00:00.000Z', // 2ºA vs 2ºB        Dom 28 jun 16:00 AR
    '76': '2026-06-29T17:00:00.000Z', // 1ºC vs 3º(...)    Lun 29 jun 14:00
    '74': '2026-06-29T20:30:00.000Z', // 1ºE vs 3º(...)    Lun 29 jun 17:30
    '75': '2026-06-30T01:00:00.000Z', // 1ºF vs 2ºC        Lun 29 jun 22:00
    '78': '2026-06-30T17:00:00.000Z', // 2ºE vs 2ºI        Mar 30 jun 14:00
    '77': '2026-06-30T21:00:00.000Z', // 1ºI vs 3º(...)    Mar 30 jun 18:00
    '79': '2026-07-01T01:00:00.000Z', // 1ºA vs 3º(...)    Mar 30 jun 22:00
    '80': '2026-07-01T16:00:00.000Z', // 1ºL vs 3º(...)    Mié 1 jul 13:00
    '82': '2026-07-01T20:00:00.000Z', // 1ºG vs 3º(...)    Mié 1 jul 17:00
    '81': '2026-07-02T00:00:00.000Z', // 1ºD vs 3º(...)    Mié 1 jul 21:00
    '84': '2026-07-02T19:00:00.000Z', // 1ºH vs 2ºJ        Jue 2 jul 16:00
    '87': '2026-07-02T23:00:00.000Z', // 1ºK vs 3º(...)    Jue 2 jul 20:00
    '85': '2026-07-03T03:00:00.000Z', // 1ºB vs 3º(...)    Vie 3 jul 00:00
    '88': '2026-07-03T18:00:00.000Z', // 2ºD vs 2ºG        Vie 3 jul 15:00 (sin cambio)
    '86': '2026-07-03T22:00:00.000Z', // 1ºJ vs 2ºH        Vie 3 jul 19:00
    '83': '2026-07-04T01:30:00.000Z', // 2ºK vs 2ºL        Vie 3 jul 22:30
    '96': '2026-07-04T17:00:00.000Z', // Octavos           Sáb 4 jul 14:00
    '95': '2026-07-04T21:00:00.000Z', // Octavos           Sáb 4 jul 18:00
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
