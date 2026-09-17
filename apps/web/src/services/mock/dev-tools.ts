import type { AuthUser } from '@finder/shared'
import { loadDb, resetMockData as clearStorage } from './db'
import { getCurrentUser, setCurrentUser } from './session'

// Herramientas que SOLO existen con datos de ejemplo: cambiar de persona sin contraseña
// y volver a los datos iniciales. Sirven para probar la web desde los dos lados
// (quien publica y quien reclama).

export function getMockAccounts(): AuthUser[] {
  return loadDb().accounts
}

export function switchMockUser(id: string): void {
  setCurrentUser(loadDb().accounts.find((account) => account.id === id) ?? null)
}

export function resetMockData(): void {
  clearStorage()
  setCurrentUser(getCurrentUser())
}
