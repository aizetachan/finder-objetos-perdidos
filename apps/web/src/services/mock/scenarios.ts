export type SignInScenario =
  | 'success'
  | 'invalid-credentials'
  | 'too-many-requests'
  | 'network-error'

export type SignUpScenario = 'success' | 'already-exists' | 'network-error'

export type SignInWithGoogleScenario = 'success' | 'popup-closed' | 'network-error'

export type SendEmailVerificationScenario =
  | 'success'
  | 'too-many-requests'
  | 'network-error'

export type VerifyEmailScenario =
  | 'success'
  | 'expired'
  | 'already-used'
  | 'network-error'

export type StartGuestPublishScenario = 'success' | 'too-many-requests' | 'network-error'
export type ConfirmGuestEmailScenario =
  | 'success'
  | 'expired'
  | 'already-used'
  | 'email-has-account'
  | 'network-error'

export type SignInWithGuestLinkScenario =
  | 'success'
  | 'expired'
  | 'already-used'
  | 'network-error'

export type CompleteGuestAccountScenario = 'success' | 'network-error'

export type StartIdentityVerificationScenario = 'success' | 'network-error'

export type IdentityResultScenario = 'verified' | 'rejected' | 'pending'

export type CreateItemScenario = 'success' | 'network-error'

export type CreateClaimScenario = 'success' | 'network-error'

export interface MockScenarios {
  signIn: SignInScenario
  signUp: SignUpScenario
  signInWithGoogle: SignInWithGoogleScenario
  sendEmailVerification: SendEmailVerificationScenario
  verifyEmail: VerifyEmailScenario
  startGuestPublish: StartGuestPublishScenario
  confirmGuestEmail: ConfirmGuestEmailScenario
  signInWithGuestLink: SignInWithGuestLinkScenario
  completeGuestAccount: CompleteGuestAccountScenario
  startIdentityVerification: StartIdentityVerificationScenario
  identityResult: IdentityResultScenario
  createItem: CreateItemScenario
  createClaim: CreateClaimScenario
}

export const DEFAULT_SCENARIOS: MockScenarios = {
  signIn: 'success',
  signUp: 'success',
  signInWithGoogle: 'success',
  sendEmailVerification: 'success',
  verifyEmail: 'success',
  startGuestPublish: 'success',
  confirmGuestEmail: 'success',
  signInWithGuestLink: 'success',
  completeGuestAccount: 'success',
  startIdentityVerification: 'success',
  identityResult: 'verified',
  createItem: 'success',
  createClaim: 'success',
}

const STORAGE_KEY = 'finder_mock_scenarios'

export function getScenarios(): MockScenarios {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SCENARIOS }
    const parsed = JSON.parse(raw) as Partial<MockScenarios>
    return { ...DEFAULT_SCENARIOS, ...parsed }
  } catch {
    return { ...DEFAULT_SCENARIOS }
  }
}

export function setScenario<K extends keyof MockScenarios>(
  key: K,
  value: MockScenarios[K],
): void {
  try {
    const current = getScenarios()
    current[key] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    window.dispatchEvent(new CustomEvent('finder:scenarios-changed', { detail: current }))
  } catch {
    // Si localStorage no está disponible (ej. modo privado estricto), no bloquea la ejecución
  }
}

export function resetScenarios(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(
      new CustomEvent('finder:scenarios-changed', { detail: { ...DEFAULT_SCENARIOS } }),
    )
  } catch {
    // ignorar
  }
}
