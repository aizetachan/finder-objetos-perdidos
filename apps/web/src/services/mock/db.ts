import { seed, type SeedData } from '@finder/shared'

// "Base de datos" de ejemplo: vive en el navegador (localStorage), así lo que se crea
// sigue ahí al recargar. Arranca con los datos de packages/shared/src/seed/seed.ts.

const DB_KEY = 'finder:mock-db:v1'
const SESSION_KEY = 'finder:mock-session:v1'

export type MockDb = SeedData

export function loadDb(): MockDb {
  try {
    const saved = localStorage.getItem(DB_KEY)
    if (saved) return JSON.parse(saved) as MockDb
  } catch {
    // Si lo guardado está roto, se empieza de cero con los datos de ejemplo.
  }
  return structuredClone(seed)
}

export function saveDb(db: MockDb): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

/** Lee, deja modificar y guarda. Devuelve lo que devuelva `change`. */
export function updateDb<T>(change: (db: MockDb) => T): T {
  const db = loadDb()
  const result = change(db)
  saveDb(db)
  return result
}

// Sesión: qué persona de ejemplo está "dentro". Por defecto, la primera.
// `null` guardado a propósito = se ha cerrado sesión.
export function loadSessionUserId(): string | null {
  const saved = localStorage.getItem(SESSION_KEY)
  if (saved === null) return seed.accounts[0]?.id ?? null
  return saved === '' ? null : saved
}

export function saveSessionUserId(id: string | null): void {
  localStorage.setItem(SESSION_KEY, id ?? '')
}

/** Borra todo lo creado y vuelve a los datos de ejemplo iniciales. */
export function resetMockData(): void {
  localStorage.removeItem(DB_KEY)
  localStorage.removeItem(SESSION_KEY)
}

// Pequeña espera para que la web se comporte como con datos reales (estados de "cargando").
export function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}
