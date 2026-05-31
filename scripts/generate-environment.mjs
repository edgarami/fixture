/**
 * Genera environment.ts y environment.prod.ts desde variables de entorno (Netlify).
 * Uso local: copiá valores a scripts/local-secrets.env o exportá FIREBASE_* antes del build.
 */
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { loadLocalEnv } from './load-local-env.mjs';

loadLocalEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const envDir = join(__dirname, '..', 'src', 'environments');

if (!process.env.FIREBASE_API_KEY) {
    console.log(
        'Sin FIREBASE_API_KEY en entorno → se usan src/environments/environment.ts del repositorio.',
    );
    process.exit(0);
}

function envValue(name, fallback = '') {
    const v = process.env[name];
    return v && v.trim() ? v.trim() : fallback;
}

const firebase = {
    apiKey: envValue('FIREBASE_API_KEY', 'TU_API_KEY'),
    authDomain: envValue('FIREBASE_AUTH_DOMAIN', 'TU_PROYECTO.firebaseapp.com'),
    projectId: envValue('FIREBASE_PROJECT_ID', 'TU_PROYECTO_ID'),
    storageBucket: envValue(
        'FIREBASE_STORAGE_BUCKET',
        'TU_PROYECTO.firebasestorage.app',
    ),
    messagingSenderId: envValue('FIREBASE_MESSAGING_SENDER_ID', '123456789012'),
    appId: envValue('FIREBASE_APP_ID', '1:123456789012:web:xxxxxxxx'),
};

function formatFile(production) {
    return `/** Generado por scripts/generate-environment.mjs — no editar a mano en CI */\nexport const environment = {
  production: ${production},
  firebase: {
    apiKey: '${firebase.apiKey}',
    authDomain: '${firebase.authDomain}',
    projectId: '${firebase.projectId}',
    storageBucket: '${firebase.storageBucket}',
    messagingSenderId: '${firebase.messagingSenderId}',
    appId: '${firebase.appId}',
  },
};
`;
}

writeFileSync(join(envDir, 'environment.ts'), formatFile(false), 'utf8');
writeFileSync(join(envDir, 'environment.prod.ts'), formatFile(true), 'utf8');

const missing = Object.entries(firebase).filter(([, v]) => v.startsWith('TU_'));
if (missing.length > 0) {
    console.warn(
        'Advertencia: faltan variables FIREBASE_* — el build puede fallar en runtime. Configuralas en Netlify.',
    );
} else {
    console.log('environment.ts y environment.prod.ts generados correctamente.');
}
