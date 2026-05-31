# Deploy en Netlify

## Qué se corrigió

1. **`environment.ts`** ya no está en `.gitignore` — Netlify puede compilar el proyecto.
2. **`angular.json`** — assets arreglados (antes tenía JSON inválido y el plugin de Netlify fallaba).
3. **`netlify.toml`** — comando `npm run build:netlify` y carpeta de publicación correcta.
4. **Redirects SPA** — rutas de Angular (`/login`, `/matches`, etc.) funcionan al recargar la página.

## Pasos en Netlify

1. Conectá el repo `edgarami/fixture` en Netlify.
2. Dejá que use **`netlify.toml`** (no hace falta poner `ng build` a mano en la UI).
3. Si preferís variables de entorno en lugar de claves en el repo, en **Site settings → Environment variables** agregá:

| Variable | Ejemplo |
|----------|---------|
| `FIREBASE_API_KEY` | tu apiKey |
| `FIREBASE_AUTH_DOMAIN` | fixture-2e6ad.firebaseapp.com |
| `FIREBASE_PROJECT_ID` | fixture-2e6ad |
| `FIREBASE_STORAGE_BUCKET` | fixture-2e6ad.firebasestorage.app |
| `FIREBASE_MESSAGING_SENDER_ID` | 167204193948 |
| `FIREBASE_APP_ID` | 1:167204193948:web:... |

4. **Deploy** de nuevo.

## Firebase después del deploy

1. **Authentication** → **Settings** → **Authorized domains**
2. Agregá tu dominio de Netlify (ej. `algo.netlify.app`)

## Build local (igual que Netlify)

```bash
npm run build:netlify
```

Salida: `dist/fixture-app/browser`
