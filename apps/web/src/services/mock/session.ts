import type { AuthUser } from '@finder/shared'
import { loadDb, loadSessionUserId, saveSessionUserId } from './db'

// Sesión simulada: quién está "dentro" y a quién hay que avisar cuando cambia.

type AuthListener = (user: AuthUser | null) => void
export const authListeners = new Set<AuthListener>()

export function getCurrentUser(): AuthUser | null {
  const id = loadSessionUserId()
  if (!id) return null
  return loadDb().accounts.find((account) => account.id === id) ?? null
}

export function setCurrentUser(user: AuthUser | null): void {
  saveSessionUserId(user?.id ?? null)
  for (const listener of authListeners) listener(user)
}
