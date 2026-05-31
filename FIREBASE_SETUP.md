# Guía paso a paso — Firebase para Fixture App

Ya creaste el proyecto en Firebase. Sigue estos pasos **en orden**.

---

## PASO 1 — Registrar la app web y obtener las claves

1. Entrá a [Firebase Console](https://console.firebase.google.com).
2. Clic en **tu proyecto** (el que acabas de crear).
3. En la página principal (Resumen / Project overview), buscá el recuadro **“Empieza agregando Firebase a tu app”** o los iconos de plataforma.
4. Clic en el icono **Web** (`</>`).
5. **Apodo de la app:** escribí `fixture-app` (o el nombre que quieras).
6. **No marques** “Firebase Hosting” por ahora (podés activarlo después).
7. Clic en **Registrar app**.
8. Te mostrará un bloque de código parecido a esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mi-proyecto.firebaseapp.com",
  projectId: "mi-proyecto",
  storageBucket: "mi-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

9. **Copiá esos 6 valores** (los necesitás en el Paso 2).
10. Clic en **Continuar con la consola** (los pasos de npm del asistente podés saltarlos; el proyecto ya tiene Firebase instalado).

**Si ya registraste la app y no ves el código:**

- Clic en el **engranaje** ⚙️ junto a “Descripción del proyecto” → **Configuración del proyecto**.
- Bajá hasta **“Tus apps”** → seleccioná la app Web.
- En **“SDK de Firebase”** → **Configuración**.

---

## PASO 2 — Pegar las claves en tu proyecto Angular

1. En Cursor/VS Code, abrí el archivo:

   `src/environments/environment.ts`

2. Reemplazá **cada valor** entre comillas con el de tu `firebaseConfig`:

| En `environment.ts` | Viene de Firebase |
|----------------------|-------------------|
| `apiKey` | `apiKey` |
| `authDomain` | `authDomain` |
| `projectId` | `projectId` |
| `storageBucket` | `storageBucket` |
| `messagingSenderId` | `messagingSenderId` |
| `appId` | `appId` |

3. **Ejemplo** (con datos ficticios):

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx',
    authDomain: 'fixture-mundial.firebaseapp.com',
    projectId: 'fixture-mundial',
    storageBucket: 'fixture-mundial.appspot.com',
    messagingSenderId: '123456789012',
    appId: '1:123456789012:web:abc123def456',
  },
};
```

4. **Guardá el archivo** (Ctrl+S).

⚠️ No subas claves a repositorios públicos. Si usás GitHub, considerá no commitear claves o usar variables de entorno en producción.

---

## PASO 3 — Activar inicio de sesión con correo y contraseña

1. En Firebase Console, menú izquierdo → **Compilación** (o **Build**) → **Authentication**.
2. Si es la primera vez: clic en **Comenzar** / **Get started**.
3. Pestaña **Sign-in method** / **Método de acceso**.
4. En la lista, buscá **Correo electrónico/Contraseña** (Email/Password).
5. Clic en esa fila.
6. Activa el interruptor **Habilitar** / **Enable** (solo la primera opción “Correo electrónico/contraseña”, no hace falta “Vínculo de correo electrónico” por ahora).
7. **Guardar**.

Con esto los usuarios podrán registrarse e iniciar sesión desde tu app.

---

## PASO 4 — Crear la base de datos Firestore

1. Menú izquierdo → **Compilación** → **Firestore Database**.
2. Clic en **Crear base de datos**.
3. **Ubicación:** elegí la más cercana (ej. `southamerica-east1` São Paulo, o `us-central` si no aparece Sudamérica). **No se puede cambiar después.**
4. **Modo de seguridad:**
   - Elegí **Comenzar en modo de producción** (las reglas las vas a pegar vos en el Paso 5).
   - Si solo ofrece modo prueba, elegí producción y luego pegá las reglas igual.
5. Clic en **Crear**.

Verás una pantalla vacía (sin colecciones). Es normal.

---

## PASO 5 — Publicar las reglas de seguridad

Sin esto la app dará error **“Missing or insufficient permissions”**.

### Opción recomendada: desde la consola web

1. En **Firestore Database**, pestaña **Reglas** / **Rules** (arriba).
2. En tu proyecto (Cursor), abrí el archivo `firestore.rules` en la raíz.
3. **Seleccioná todo** el contenido (Ctrl+A) y **copiá**.
4. En Firebase Console, **borrá** lo que haya en el editor de reglas y **pegá** el contenido de `firestore.rules`.
5. Clic en **Publicar** / **Publish**.

Deberías ver un mensaje de que las reglas se actualizaron.

---

## PASO 6 — (Opcional) Documento de resultados oficiales

Solo necesario cuando quieras sumar puntos por **campeón del torneo** u **orden de grupos**. Podés hacerlo después.

1. Firestore → pestaña **Datos** / **Data**.
2. Clic en **Iniciar colección** / **Start collection**.
3. **ID de colección:** `config` → Siguiente.
4. **ID de documento:** `results`.
5. Agregá campos:

| Campo | Tipo | Valor inicial |
|-------|------|----------------|
| `champion` | string | (dejá vacío o `null` si permite) |
| `groups` | map | vacío o mapa con claves de tus grupos |

Para `groups` como mapa, podés agregar campos hijos `Grupo A`, `Grupo B`, etc. con valor `null` hasta tener resultados reales.

6. **Guardar**.

---

## PASO 7 — Probar la app en tu computadora

1. Abrí una terminal en la carpeta del proyecto `fixture`.
2. Ejecutá:

```bash
npm start
```

3. Esperá el mensaje con la URL (suele ser `http://localhost:4200`).
4. Abrí el navegador en: `http://localhost:4200/login`
5. Pestaña **Registrarse**:
   - Nombre completo
   - Teléfono
   - Correo (usá uno real o de prueba)
   - Contraseña (mínimo 6 caracteres)
6. Clic en **CREAR CUENTA**.

### Qué verificar si funcionó

**En Firebase Console → Authentication → Users:**  
Debe aparecer tu correo.

**En Firestore → Datos:**

- Colección `profiles` → un documento con ID largo (tu `uid`) con `name`, `phone`, `email`.

**En la app:**  
Te redirige a `/home`. Entrá a **Partidos**, hacé una apuesta, y en Firestore debería aparecer la colección `bets`.

### Errores frecuentes

| Mensaje | Solución |
|---------|----------|
| `auth/invalid-api-key` | Revisá `apiKey` en `environment.ts` |
| `Missing or insufficient permissions` | Repetí Paso 5 (reglas) |
| `auth/operation-not-allowed` | Repetí Paso 3 (Email/Password habilitado) |
| Pantalla en blanco al cargar partidos | Verificá que exista `public/assets/matches.json` |

---

## PASO 8 — Iniciar sesión otro día

1. `http://localhost:4200/login`
2. Pestaña **Iniciar sesión**
3. Mismo correo y contraseña del registro

La sesión se mantiene al recargar la página (Firebase guarda la sesión en el navegador).

---

## PASO 9 — Cuando publiques la web en Internet

1. **Authentication** → **Settings** / **Configuración** → **Authorized domains**.
2. Por defecto están `localhost` y tu dominio de Firebase.
3. Si usás **Vercel**, **Netlify** o dominio propio, agregá ese dominio ahí (ej. `mi-fixture.vercel.app`).

Sin esto, el login fallará en producción aunque funcione en local.

---

## PASO 10 — Publicar la app (cuando estés listo)

```bash
npm run build
```

La carpina generada está en `dist/fixture-app/browser`.

**Firebase Hosting (opcional):**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Seguí el asistente: carpeta pública = `dist/fixture-app/browser`.

---

## Resumen visual del flujo

```
[Firebase Console]
     │
     ├─► App Web → copiar firebaseConfig → environment.ts
     ├─► Authentication → Email/Password ON
     ├─► Firestore → crear BD
     ├─► Firestore → Reglas → pegar firestore.rules → Publicar
     └─► (opcional) config/results

[Tu PC]
     npm start → /login → registrarse → apostar
```

---

## ¿Necesitás el backend de la carpeta `backend/`?

**No** para usuarios en la nube. Solo Firebase + la app Angular.

---

Si te trabás en un paso concreto, anotá **en qué número estás** y el **mensaje de error exacto** (o una captura) y lo revisamos.
