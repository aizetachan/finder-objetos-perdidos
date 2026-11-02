import type { AuthUser, IdentityStatus } from '@finder/shared'
import { loadDb, resetMockData as clearStorage, updateDb } from './db'
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

export function setMockIdentityStatus(status: IdentityStatus): void {
  const current = getCurrentUser()
  if (!current) return
  updateDb((db) => {
    const acc = db.accounts.find((a) => a.id === current.id)
    if (acc) acc.identityStatus = status
  })
  setCurrentUser({ ...current, identityStatus: status })
}

/**
 * Crea una reclamación de prueba sobre el último objeto del invitado actual,
 * para poder probar inmediatamente el flujo de completar cuenta y responder.
 */
export function createTestClaimOnLastGuestItem(): { ok: boolean; message: string } {
  const current = getCurrentUser()
  if (!current || !current.isGuest) {
    return { ok: false, message: 'Solo se puede crear con una cuenta temporal de invitado en sesión.' }
  }

  const db = loadDb()
  const myItems = db.items.filter((i) => i.createdBy === current.id)
  if (myItems.length === 0) {
    return { ok: false, message: 'Primero publica un objeto como invitado para poder reclamarlo.' }
  }

  const lastItem = myItems[myItems.length - 1]
  if (!lastItem) {
    return { ok: false, message: 'No se ha encontrado ningún objeto propio.' }
  }

  // Buscar un usuario del seed distinto del invitado para actuar como reclamante
  const claimant = db.accounts.find((a) => a.id !== current.id && !a.isGuest) ?? db.accounts[0]
  if (!claimant) {
    return { ok: false, message: 'No hay cuentas de prueba disponibles para reclamar.' }
  }

  const now = new Date().toISOString()
  updateDb((d) => {
    d.claims.push({
      id: `claim-${crypto.randomUUID().slice(0, 8)}`,
      itemId: lastItem.id,
      itemTitle: lastItem.title,
      itemOwnerId: current.id,
      claimantId: claimant.id,
      claimantContact: {
        name: claimant.displayName,
        email: claimant.email,
      },
      proof: 'Prueba de propiedad simulada: tiene un pequeño grabado con las iniciales en la base.',
      status: 'pending',
      createdAt: now,
    })
  })

  return { ok: true, message: `Reclamación creada sobre «${lastItem.title}».` }
}

export {
  DEFAULT_SCENARIOS,
  getScenarios,
  resetScenarios,
  setScenario,
} from './scenarios'
export type {
  CompleteGuestAccountScenario,
  ConfirmGuestEmailScenario,
  CreateClaimScenario,
  CreateItemScenario,
  IdentityResultScenario,
  MockScenarios,
  SendEmailVerificationScenario,
  SignInScenario,
  SignInWithGuestLinkScenario,
  SignInWithGoogleScenario,
  SignUpScenario,
  StartGuestPublishScenario,
  StartIdentityVerificationScenario,
  VerifyEmailScenario,
} from './scenarios'

