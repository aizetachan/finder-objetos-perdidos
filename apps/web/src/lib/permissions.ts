import type { AuthUser } from '@finder/shared'

export type PermissionCheckResult =
  | { ok: true }
  | {
      ok: false
      reason:
        | 'not-signed-in'
        | 'email-not-verified'
        | 'identity-not-verified'
        | 'guest-account'
    }

/**
 * Regla de publicación: requiere tener sesión iniciada y el email verificado.
 * Las cuentas de invitado (hallador temporal) con email verificado están autorizadas.
 */
export function canPublish(user: AuthUser | null): PermissionCheckResult {
  if (!user) {
    return { ok: false, reason: 'not-signed-in' }
  }
  if (!user.emailVerified) {
    return { ok: false, reason: 'email-not-verified' }
  }
  return { ok: true }
}

/**
 * Regla de reclamación: requiere tener sesión regular iniciada, el email verificado
 * y la identidad comprobada mediante DNI o pasaporte. Las cuentas de invitado deben completarse primero.
 */
export function canClaim(user: AuthUser | null): PermissionCheckResult {
  if (!user) {
    return { ok: false, reason: 'not-signed-in' }
  }
  if (user.isGuest) {
    return { ok: false, reason: 'guest-account' }
  }
  if (!user.emailVerified) {
    return { ok: false, reason: 'email-not-verified' }
  }
  if (user.identityStatus !== 'verified') {
    return { ok: false, reason: 'identity-not-verified' }
  }
  return { ok: true }
}

/**
 * Regla para responder a una reclamación: quien responde debe ser una cuenta normal (no de invitado).
 * Las cuentas de invitado deben completar su cuenta antes de aceptar o rechazar.
 */
export function canResolveClaim(user: AuthUser | null): PermissionCheckResult {
  if (!user) {
    return { ok: false, reason: 'not-signed-in' }
  }
  if (user.isGuest) {
    return { ok: false, reason: 'guest-account' }
  }
  return { ok: true }
}
