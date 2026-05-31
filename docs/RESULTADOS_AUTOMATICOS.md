# Resultados automáticos y puntos en tiempo real

## Qué mejoramos

| Antes | Ahora |
|-------|--------|
| Partidos solo en `matches.json` | Firestore `matches` + tiempo real en la app |
| Editás JSON a mano | Script que lee una API deportiva |
| Recargar para ver puntos | Al cambiar un partido en Firestore, el ranking se recalcula solo |

## Cómo funciona

```
football-data.org API
        │
        ▼  (cada 10–15 min, GitHub Actions o manual)
scripts/sync-match-results.mjs
        │
        ▼
Firestore: matches { score1, score2, isFinished }
        │
        ▼  onSnapshot (tiempo real)
App Angular → fetchRanking() → pantalla Ranking / Perfil
```

---

## Paso 1 — Publicar reglas nuevas

Firebase Console → Firestore → **Reglas** → pegá el `firestore.rules` del proyecto (incluye `matches`) → **Publicar**.

---

## Paso 2 — Cuenta de servicio (para scripts)

1. Firebase Console → ⚙️ **Configuración del proyecto**
2. Pestaña **Cuentas de servicio**
3. **Generar nueva clave privada** → descarga JSON
4. Guardalo como: `scripts/service-account.json`  
   (está en `.gitignore`, no lo subas a GitHub)

---

## Paso 3 — API de resultados (gratis con límites)

1. Registrate en [football-data.org](https://www.football-data.org/client/register)
2. Copiá tu **API Token**
3. En PowerShell, antes de sincronizar:

```powershell
$env:FOOTBALL_DATA_API_KEY = "tu_token_aqui"
$env:FOOTBALL_COMPETITION_CODE = "WC"
```

El código `WC` es el Mundial; si la API no devuelve datos aún, probá el código que figure en su documentación para tu competición.

**Límite gratis:** ~10 peticiones por minuto (suficiente para cron cada 15 min).

---

## Paso 4 — Subir partidos a Firestore (una vez)

```bash
npm install
npm run firebase:seed-matches
```

Esto copia `public/assets/matches.json` → colección `matches`.

---

## Paso 5 — Probar sincronización manual

```bash
npm run firebase:sync-results
```

Deberías ver líneas `✓ México 2-1 Sudáfrica (FINISHED)` etc.

Abrí la app: los marcadores y el ranking deberían actualizarse **sin recargar** (unos segundos).

---

## Paso 6 — Automatizar (recomendado)

### Opción A — GitHub Actions (gratis)

1. En GitHub → tu repo → **Settings** → **Secrets**
2. Creá:
   - `FIREBASE_SERVICE_ACCOUNT` → contenido completo del JSON de la cuenta de servicio
   - `FOOTBALL_DATA_API_KEY` → tu token
3. El workflow `.github/workflows/sync-match-results.yml` corre cada 15 minutos.

### Opción B — Tarea programada en Windows

Programador de tareas → ejecutar cada 15 min:

```powershell
cd C:\Users\Administrator\fixture
$env:FOOTBALL_DATA_API_KEY = "..."
npm run firebase:sync-results
```

### Opción C — Cloud Functions (Firebase Blaze)

Solo si upgradás el plan: una función `onSchedule` cada 15 min hace lo mismo que el script.

---

## Si un equipo no coincide

El script compara nombres ES ↔ EN con `scripts/team-name-map.json`.  
Agregá una línea:

```json
"nombre en tu app": ["Nombre en API", "Otro alias"]
```

---

## Otras mejoras posibles (futuro)

- Panel admin en la app para corregir un marcador a mano
- Notificación push cuando sumás puntos
- API alternativa: API-Football (RapidAPI), más datos del Mundial
- Migrar `config/results` con botón “cerrar grupo”

---

## Resumen de comandos

| Comando | Cuándo |
|---------|--------|
| `npm run firebase:seed-matches` | Una vez (o si cambiás el fixture) |
| `npm run firebase:sync-results` | Manual o automático cada 15 min |
| Publicar `firestore.rules` | Después de actualizar reglas |
