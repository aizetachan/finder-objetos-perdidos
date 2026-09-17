import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

// Conexión con Firebase. Este archivo SOLO lo usa services/firebase/.
// Con datos de ejemplo (VITE_USE_MOCKS distinto de "false") ni siquiera se carga.

// En local se usa un proyecto de mentira ("demo-..."): Firebase garantiza que un proyecto demo
// nunca toca nada real, y los emuladores funcionan sin claves ni inicio de sesión.
const EMULATOR_PROJECT_ID = 'demo-finder'

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.DEV ? EMULATOR_PROJECT_ID : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

export const auth = getAuth(app)
export const db = getFirestore(app)

// En local (pnpm dev) se trabaja SIEMPRE contra los emuladores, nunca contra el proyecto real.
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
