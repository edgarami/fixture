import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getFirestore() {
    if (admin.apps.length > 0) {
        return admin.firestore();
    }

    const credPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        join(__dirname, 'service-account.json');

    if (!existsSync(credPath)) {
        console.error(`
No se encontró la cuenta de servicio de Firebase.
1. Firebase Console → Configuración del proyecto → Cuentas de servicio
2. "Generar nueva clave privada" → guardar como:
   scripts/service-account.json
O definir la variable GOOGLE_APPLICATION_CREDENTIALS con la ruta al JSON.
`);
        process.exit(1);
    }

    const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    return admin.firestore();
}
