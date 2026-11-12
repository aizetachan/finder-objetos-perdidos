import type { AuthUser, Claim, Donation, DonationRequest, Item } from '@finder/shared'
import { canClaim, canPublish, canResolveClaim } from '@/lib/permissions'
import { ServiceError, type Services } from '../types'
import { delay, loadDb, newId, updateDb } from './db'
import { getScenarios } from './scenarios'
import { authListeners, getCurrentUser, setCurrentUser } from './session'

// Implementación con DATOS DE EJEMPLO. Cumple el mismo contrato que la de Firebase
// e imita sus reglas de seguridad (quién puede ver y hacer qué).

function requireUser(): AuthUser {
  const user = getCurrentUser()
  if (!user) throw new ServiceError('not-signed-in', 'Tienes que entrar en tu cuenta para hacer esto.')
  return user
}

const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt)

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export const services: Services = {
  getCurrentUser,

  onAuthChange(listener) {
    authListeners.add(listener)
    // Igual que Firebase: nada más empezar a escuchar, avisa de cómo está la sesión ahora.
    queueMicrotask(() => {
      if (authListeners.has(listener)) listener(getCurrentUser())
    })
    return () => authListeners.delete(listener)
  },

  async signIn(email, password) {
    await delay()
    const scenario = getScenarios().signIn
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'too-many-requests') {
      throw new ServiceError(
        'too-many-requests',
        'Demasiados intentos. Espera unos minutos y vuelve a probar.',
      )
    }
    if (scenario === 'invalid-credentials') {
      throw new ServiceError('invalid', 'El email o la contraseña no son correctos.')
    }

    const cleanEmail = email.trim().toLowerCase()
    // En modo de ejemplo vale cualquier contraseña no vacía: solo se comprueba la existencia de la cuenta
    if (!password || !password.trim()) {
      throw new ServiceError('invalid', 'El email o la contraseña no son correctos.')
    }
    const account = loadDb().accounts.find((a) => a.email === cleanEmail)
    if (!account) {
      throw new ServiceError('invalid', 'El email o la contraseña no son correctos.')
    }
    setCurrentUser(account)
    return account
  },

  async signUp({ email, displayName }) {
    await delay()
    const scenario = getScenarios().signUp
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'already-exists') {
      throw new ServiceError('already-exists', 'Ya existe una cuenta con ese email.')
    }

    const cleanEmail = email.trim().toLowerCase()
    const account = updateDb((db) => {
      if (db.accounts.some((a) => a.email === cleanEmail)) {
        throw new ServiceError('already-exists', 'Ya existe una cuenta con ese email.')
      }
      const created: AuthUser = {
        id: newId('user'),
        email: cleanEmail,
        displayName,
        emailVerified: false,
        identityStatus: 'none',
        isGuest: false,
      }
      db.accounts.push(created)
      db.users.push({ id: created.id, displayName, createdAt: new Date().toISOString() })
      return created
    })
    setCurrentUser(account)
    return account
  },

  async signInWithGoogle() {
    await delay()
    const scenario = getScenarios().signInWithGoogle
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'popup-closed') {
      throw new ServiceError(
        'popup-closed',
        'Has cerrado la ventana antes de completar el inicio de sesión.',
      )
    }

    const db = loadDb()
    let account = db.accounts.find((a) => a.email === 'lucia@example.com')
    if (!account) {
      account = updateDb((d) => {
        const created: AuthUser = {
          id: newId('user'),
          email: 'lucia.google@example.com',
          displayName: 'Lucía Martín',
          emailVerified: true,
          identityStatus: 'none',
          isGuest: false,
        }
        d.accounts.push(created)
        d.users.push({ id: created.id, displayName: created.displayName, createdAt: new Date().toISOString() })
        return created
      })
    } else if (!account.emailVerified) {
      account = updateDb((d) => {
        const acc = d.accounts.find((a) => a.id === account?.id)
        if (acc) {
          acc.emailVerified = true
        }
        return acc ?? account!
      })
    }
    setCurrentUser(account)
    return account
  },

  async startGuestPublish(email: string) {
    await delay()
    const scenario = getScenarios().startGuestPublish
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'too-many-requests') {
      throw new ServiceError(
        'too-many-requests',
        'Demasiados intentos. Espera unos minutos y vuelve a probar.',
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    try {
      sessionStorage.setItem('finder_pending_guest_email', cleanEmail)
    } catch {
      // Si sessionStorage no está disponible, no bloquea
    }
  },

  async confirmGuestEmail(_code: string) {
    await delay()
    const scenario = getScenarios().confirmGuestEmail
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'expired') {
      throw new ServiceError('expired', 'El enlace ha caducado. Vuelve a solicitar la confirmación.')
    }
    if (scenario === 'already-used') {
      throw new ServiceError('already-used', 'Este enlace ya se ha utilizado.')
    }
    if (scenario === 'email-has-account') {
      throw new ServiceError('already-exists', 'Este email ya tiene cuenta. Entra para publicar.')
    }

    let pendingEmail = 'invitado@example.com'
    try {
      const saved = sessionStorage.getItem('finder_pending_guest_email')
      if (saved) pendingEmail = saved
    } catch {
      // fallback
    }

    const cleanEmail = pendingEmail.trim().toLowerCase()

    // Si ya existe una cuenta normal con este email, avisar de que debe entrar
    const existing = loadDb().accounts.find((a) => a.email === cleanEmail)
    if (existing && !existing.isGuest) {
      throw new ServiceError('already-exists', 'Este email ya tiene cuenta. Entra para publicar.')
    }

    const account = updateDb((db) => {
      const existingGuest = db.accounts.find((a) => a.email === cleanEmail)
      if (existingGuest) {
        existingGuest.emailVerified = true
        return existingGuest
      }

      const namePrefix = cleanEmail.split('@')[0] ?? 'Invitado'
      const displayName = namePrefix.charAt(0).toUpperCase() + namePrefix.slice(1)
      const created: AuthUser = {
        id: newId('guest'),
        email: cleanEmail,
        displayName,
        emailVerified: true,
        identityStatus: 'none',
        isGuest: true,
      }
      db.accounts.push(created)
      db.users.push({ id: created.id, displayName, createdAt: new Date().toISOString() })
      return created
    })

    setCurrentUser(account)
    return account
  },

  async signInWithGuestLink(_code: string) {
    await delay()
    const scenario = getScenarios().signInWithGuestLink
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'expired') {
      throw new ServiceError(
        'expired',
        'Este enlace ya no es válido. Entra en tu email: te enviaremos uno nuevo cuando haya novedades.',
      )
    }
    if (scenario === 'already-used') {
      throw new ServiceError(
        'already-used',
        'Este enlace ya no es válido. Entra en tu email: te enviaremos uno nuevo cuando haya novedades.',
      )
    }

    const current = getCurrentUser()
    if (current && current.isGuest) {
      return current
    }

    // Buscar una cuenta de invitado existente en la base de datos
    const guestAccount = loadDb().accounts.find((a) => a.isGuest)
    if (guestAccount) {
      setCurrentUser(guestAccount)
      return guestAccount
    }

    // Si no existe ninguna en la base de datos simulada, crear una de ejemplo
    const email = 'invitado@example.com'
    const account = updateDb((db) => {
      const created: AuthUser = {
        id: newId('guest'),
        email,
        displayName: 'Invitado',
        emailVerified: true,
        identityStatus: 'none',
        isGuest: true,
      }
      db.accounts.push(created)
      db.users.push({ id: created.id, displayName: created.displayName, createdAt: new Date().toISOString() })
      return created
    })
    setCurrentUser(account)
    return account
  },

  async completeGuestAccount({ displayName }: { displayName: string; password: string }) {
    await delay()
    const scenario = getScenarios().completeGuestAccount
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }

    const user = requireUser()
    if (!user.isGuest) {
      throw new ServiceError('not-allowed', 'Esta cuenta ya está completada.')
    }

    const cleanName = displayName.trim()
    const updated = updateDb((db) => {
      const acc = db.accounts.find((a) => a.id === user.id)
      if (!acc) throw new ServiceError('not-found', 'No se ha encontrado la cuenta.')
      acc.displayName = cleanName
      acc.isGuest = false

      const u = db.users.find((usr) => usr.id === user.id)
      if (u) {
        u.displayName = cleanName
      }
      return acc
    })

    setCurrentUser(updated)
    return updated
  },

  async sendEmailVerification() {
    await delay()
    const scenario = getScenarios().sendEmailVerification
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'too-many-requests') {
      throw new ServiceError(
        'too-many-requests',
        'Demasiados intentos. Espera unos minutos y vuelve a probar.',
      )
    }
  },

  async verifyEmail(_code: string) {
    await delay()
    const scenario = getScenarios().verifyEmail
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }
    if (scenario === 'expired') {
      throw new ServiceError('expired', 'El enlace ha caducado. Pide uno nuevo para continuar.')
    }
    if (scenario === 'already-used') {
      throw new ServiceError('already-used', 'Este enlace ya se ha utilizado.')
    }

    const current = getCurrentUser()
    updateDb((db) => {
      if (current) {
        const acc = db.accounts.find((a) => a.id === current.id)
        if (acc) acc.emailVerified = true
      } else {
        const unverified = [...db.accounts].reverse().find((a) => !a.emailVerified)
        if (unverified) unverified.emailVerified = true
      }
    })
    if (current) {
      setCurrentUser({ ...current, emailVerified: true })
    }
  },

  async startIdentityVerification() {
    await delay()
    const scenario = getScenarios().startIdentityVerification
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }

    const user = requireUser()
    updateDb((db) => {
      const acc = db.accounts.find((a) => a.id === user.id)
      if (acc) acc.identityStatus = 'pending'
    })
    setCurrentUser({ ...user, identityStatus: 'pending' })
    return { sessionId: newId('ident-session') }
  },

  async getIdentityStatus() {
    await delay()
    const user = requireUser()
    const account = loadDb().accounts.find((a) => a.id === user.id)
    const currentStatus = account?.identityStatus ?? 'none'

    // Si la persona está en verificación pendiente, el resultado lo decide el escenario identityResult
    if (currentStatus === 'pending') {
      const resultScenario = getScenarios().identityResult
      if (resultScenario === 'verified' || resultScenario === 'rejected') {
        updateDb((db) => {
          const acc = db.accounts.find((a) => a.id === user.id)
          if (acc) acc.identityStatus = resultScenario
        })
        setCurrentUser({ ...user, identityStatus: resultScenario })
        return resultScenario
      }
      return 'pending'
    }

    return currentStatus
  },

  async signOut() {
    await delay(150)
    setCurrentUser(null)
  },

  async getUser(id) {
    await delay()
    return loadDb().users.find((user) => user.id === id) ?? null
  },

  async getItems(filters = {}) {
    await delay()
    const query = filters.query ? normalize(filters.query) : ''
    const now = Date.now()
    const periodMs: Record<string, number> = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }
    const maxAge = filters.datePeriod ? periodMs[filters.datePeriod] : null

    return loadDb()
      .items.filter((item) => item.type === 'found' && item.status === 'published')
      .filter((item) => !filters.category || item.category === filters.category)
      .filter((item) => !filters.city || normalize(item.city) === normalize(filters.city))
      .filter((item) => {
        if (!maxAge) return true
        const itemTime = new Date(item.date).getTime()
        return !isNaN(itemTime) && now - itemTime <= maxAge && itemTime <= now + 60000
      })
      .filter(
        (item) =>
          !query ||
          normalize(`${item.title} ${item.description} ${item.locationText}`).includes(query),
      )
      .sort(newestFirst)
  },

  async getItem(id) {
    await delay()
    return loadDb().items.find((item) => item.id === id) ?? null
  },

  async getMyItems() {
    await delay()
    const user = requireUser()
    return loadDb()
      .items.filter((item) => item.createdBy === user.id)
      .sort(newestFirst)
  },

  async createItem(input) {
    await delay()
    const scenario = getScenarios().createItem
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }

    const user = requireUser()
    const check = canPublish(user)
    if (!check.ok) {
      if (check.reason === 'email-not-verified') {
        throw new ServiceError('not-allowed', 'Verifica tu email para poder publicar.')
      }
      throw new ServiceError('not-allowed', 'Tienes que entrar en tu cuenta para poder publicar.')
    }
    const { hiddenDetails, ...publicPart } = input
    const now = new Date().toISOString()
    const item: Item = {
      ...publicPart,
      id: newId('item'),
      status: 'published',
      createdBy: user.id,
      createdByName: user.displayName,
      createdAt: now,
      updatedAt: now,
    }
    updateDb((db) => {
      db.items.push(item)
      db.itemHiddenDetails[item.id] = hiddenDetails
    })
    return item
  },

  async getItemHiddenDetails(itemId) {
    await delay()
    const user = requireUser()
    const db = loadDb()
    const item = db.items.find((i) => i.id === itemId)
    if (!item) throw new ServiceError('not-found', 'Este objeto ya no existe.')
    if (item.createdBy !== user.id) {
      throw new ServiceError('not-allowed', 'Solo quien publicó el objeto puede ver estos detalles.')
    }
    return db.itemHiddenDetails[itemId] ?? ''
  },

  async markItemReturned(itemId) {
    await delay()
    const user = requireUser()
    updateDb((db) => {
      const item = db.items.find((i) => i.id === itemId)
      if (!item) throw new ServiceError('not-found', 'Este objeto ya no existe.')
      if (item.createdBy !== user.id) {
        throw new ServiceError('not-allowed', 'Solo quien publicó el objeto puede marcarlo como devuelto.')
      }
      item.status = 'returned'
      item.updatedAt = new Date().toISOString()
    })
  },

  async createClaim({ itemId, proof }) {
    await delay()
    const scenario = getScenarios().createClaim
    if (scenario === 'network-error') {
      throw new ServiceError(
        'network',
        'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
      )
    }

    const user = requireUser()
    const check = canClaim(user)
    if (!check.ok) {
      if (check.reason === 'email-not-verified') {
        throw new ServiceError('not-allowed', 'Verifica tu email para poder reclamar.')
      }
      if (check.reason === 'identity-not-verified') {
        throw new ServiceError(
          'not-allowed',
          'Verifica tu identidad con tu DNI o pasaporte para poder reclamar.',
        )
      }
      throw new ServiceError('not-allowed', 'Tienes que entrar en tu cuenta para poder reclamar.')
    }
    return updateDb((db) => {
      const item = db.items.find((i) => i.id === itemId)
      if (!item) throw new ServiceError('not-found', 'Este objeto ya no existe.')
      if (item.createdBy === user.id) {
        throw new ServiceError('not-allowed', 'No puedes reclamar un objeto que has publicado tú.')
      }
      if (item.status !== 'published') {
        throw new ServiceError('not-allowed', 'Este objeto ya no admite reclamaciones.')
      }
      if (db.claims.some((c) => c.itemId === itemId && c.claimantId === user.id)) {
        throw new ServiceError('invalid', 'Ya has reclamado este objeto.')
      }
      const claim: Claim = {
        id: newId('claim'),
        itemId,
        itemTitle: item.title,
        itemOwnerId: item.createdBy,
        claimantId: user.id,
        claimantContact: { name: user.displayName, email: user.email },
        proof,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      db.claims.push(claim)
      return claim
    })
  },

  async getMyClaims() {
    await delay()
    const user = requireUser()
    return loadDb()
      .claims.filter((claim) => claim.claimantId === user.id)
      .sort(newestFirst)
  },

  async getClaimsOnMyItems() {
    await delay()
    const user = requireUser()
    return loadDb()
      .claims.filter((claim) => claim.itemOwnerId === user.id)
      .sort(newestFirst)
  },

  async resolveClaim(claimId, status) {
    await delay()
    const user = requireUser()
    const check = canResolveClaim(user)
    if (!check.ok) {
      throw new ServiceError('not-allowed', 'Completa tu cuenta para responder a esta reclamación.')
    }
    updateDb((db) => {
      const claim = db.claims.find((c) => c.id === claimId)
      if (!claim) throw new ServiceError('not-found', 'Esta reclamación ya no existe.')
      if (claim.itemOwnerId !== user.id) {
        throw new ServiceError('not-allowed', 'Solo quien publicó el objeto puede responder.')
      }
      if (claim.status !== 'pending') {
        throw new ServiceError('invalid', 'Esta reclamación ya está respondida.')
      }
      const now = new Date().toISOString()
      claim.status = status
      claim.resolvedAt = now
      if (status === 'accepted') {
        claim.ownerContact = { name: user.displayName, email: user.email }
        const item = db.items.find((i) => i.id === claim.itemId)
        if (item) {
          item.status = 'claimed'
          item.updatedAt = now
        }
      }
    })
  },

  async cancelClaim(claimId) {
    await delay()
    const user = requireUser()
    updateDb((db) => {
      const index = db.claims.findIndex((c) => c.id === claimId)
      if (index === -1) throw new ServiceError('not-found', 'Esta reclamación ya no existe.')
      const claim = db.claims[index]
      if (claim.claimantId !== user.id) {
        throw new ServiceError('not-allowed', 'Solo la persona que realizó la reclamación puede me cancelar.')
      }
      db.claims.splice(index, 1)
    })
  },

  // — Donaciones —

  async getDonations(filters = {}) {
    await delay()
    return loadDb()
      .donations.filter((donation) => donation.status === 'available')
      .filter((donation) => !filters.category || donation.category === filters.category)
      .filter((donation) => !filters.city || normalize(donation.city) === normalize(filters.city))
      .sort(newestFirst)
  },

  async getDonation(id) {
    await delay()
    return loadDb().donations.find((donation) => donation.id === id) ?? null
  },

  async getMyDonations() {
    await delay()
    const user = requireUser()
    return loadDb()
      .donations.filter((donation) => donation.createdBy === user.id)
      .sort(newestFirst)
  },

  async createDonation(input) {
    await delay()
    const user = requireUser()
    const check = canPublish(user)
    if (!check.ok) {
      throw new ServiceError('not-allowed', 'Verifica tu email para poder publicar una donación.')
    }
    const now = new Date().toISOString()
    const donation: Donation = {
      ...input,
      id: newId('donation'),
      origin: 'direct',
      status: 'available',
      createdBy: user.id,
      createdByName: user.displayName,
      createdAt: now,
      updatedAt: now,
    }
    updateDb((db) => {
      db.donations.push(donation)
    })
    return donation
  },

  async markDonationDelivered(donationId) {
    await delay()
    const user = requireUser()
    updateDb((db) => {
      const donation = db.donations.find((d) => d.id === donationId)
      if (!donation) throw new ServiceError('not-found', 'Esta donación ya no existe.')
      if (donation.createdBy !== user.id) {
        throw new ServiceError('not-allowed', 'Solo quien dona puede marcarla como entregada.')
      }
      if (donation.status !== 'reserved') {
        throw new ServiceError('invalid', 'Primero tienes que elegir a quién se la das.')
      }
      donation.status = 'donated'
      donation.updatedAt = new Date().toISOString()
    })
  },

  async reopenDonation(donationId) {
    await delay()
    const user = requireUser()
    updateDb((db) => {
      const donation = db.donations.find((d) => d.id === donationId)
      if (!donation) throw new ServiceError('not-found', 'Esta donación ya no existe.')
      if (donation.createdBy !== user.id) {
        throw new ServiceError('not-allowed', 'Solo quien dona puede volver a ofrecerla.')
      }
      if (donation.status !== 'reserved') {
        throw new ServiceError('invalid', 'Solo se puede volver a ofrecer una donación reservada.')
      }
      donation.status = 'available'
      donation.updatedAt = new Date().toISOString()
      // La persona elegida deja de estarlo; las demás vuelven a poder ser elegidas.
      for (const request of db.donationRequests) {
        if (request.donationId !== donationId) continue
        if (request.status === 'accepted') {
          request.status = 'not_selected'
          delete request.donorContact
        } else if (request.status === 'not_selected') {
          request.status = 'pending'
          delete request.resolvedAt
        }
      }
    })
  },

  // — Solicitudes de donación —

  async createDonationRequest({ donationId, message }) {
    await delay()
    const user = requireUser()
    return updateDb((db) => {
      const donation = db.donations.find((d) => d.id === donationId)
      if (!donation) throw new ServiceError('not-found', 'Esta donación ya no existe.')
      if (donation.createdBy === user.id) {
        throw new ServiceError('not-allowed', 'No puedes solicitar una donación que has publicado tú.')
      }
      if (donation.status !== 'available') {
        throw new ServiceError('not-allowed', 'Esta donación ya no admite solicitudes.')
      }
      if (db.donationRequests.some((r) => r.donationId === donationId && r.requesterId === user.id)) {
        throw new ServiceError('invalid', 'Ya has solicitado esta donación.')
      }
      const request: DonationRequest = {
        id: newId('request'),
        donationId,
        donationTitle: donation.title,
        donorId: donation.createdBy,
        requesterId: user.id,
        requesterName: user.displayName,
        message,
        requesterContact: { name: user.displayName, email: user.email },
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      db.donationRequests.push(request)
      return request
    })
  },

  async getMyDonationRequests() {
    await delay()
    const user = requireUser()
    return loadDb()
      .donationRequests.filter((request) => request.requesterId === user.id)
      .sort(newestFirst)
  },

  async getRequestsOnMyDonations() {
    await delay()
    const user = requireUser()
    return loadDb()
      .donationRequests.filter((request) => request.donorId === user.id)
      .sort(newestFirst)
  },

  async acceptDonationRequest(requestId) {
    await delay()
    const user = requireUser()
    updateDb((db) => {
      const request = db.donationRequests.find((r) => r.id === requestId)
      if (!request) throw new ServiceError('not-found', 'Esta solicitud ya no existe.')
      if (request.donorId !== user.id) {
        throw new ServiceError('not-allowed', 'Solo quien dona puede elegir a quién se la da.')
      }
      if (request.status !== 'pending') {
        throw new ServiceError('invalid', 'Esta solicitud ya está respondida.')
      }
      const donation = db.donations.find((d) => d.id === request.donationId)
      if (!donation || donation.status !== 'available') {
        throw new ServiceError('invalid', 'Esta donación ya no está disponible.')
      }
      const now = new Date().toISOString()
      donation.status = 'reserved'
      donation.updatedAt = now
      // Quien dona elige a UNA persona: el resto queda como no seleccionada.
      for (const other of db.donationRequests) {
        if (other.donationId !== request.donationId || other.status !== 'pending') continue
        other.resolvedAt = now
        if (other.id === request.id) {
          other.status = 'accepted'
          other.donorContact = { name: user.displayName, email: user.email }
        } else {
          other.status = 'not_selected'
        }
      }
    })
  },

  async cancelDonationRequest(requestId) {
    await delay()
    const user = requireUser()
    updateDb((db) => {
      const index = db.donationRequests.findIndex((r) => r.id === requestId)
      if (index === -1) throw new ServiceError('not-found', 'Esta solicitud ya no existe.')
      const request = db.donationRequests[index]
      if (request.requesterId !== user.id) {
        throw new ServiceError('not-allowed', 'Solo quien hizo la solicitud puede retirarla.')
      }
      if (request.status !== 'pending') {
        throw new ServiceError('invalid', 'Solo se puede retirar una solicitud pendiente.')
      }
      db.donationRequests.splice(index, 1)
    })
  },
}
