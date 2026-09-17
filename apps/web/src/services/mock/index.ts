import type { AuthUser, Claim, Item } from '@finder/shared'
import { ServiceError, type Services } from '../types'
import { delay, loadDb, newId, updateDb } from './db'
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

  async signIn(email) {
    await delay()
    // En modo de ejemplo vale cualquier contraseña: solo se mira el email.
    const account = loadDb().accounts.find((a) => a.email === email.trim().toLowerCase())
    if (!account) throw new ServiceError('invalid', 'No hay ninguna cuenta con ese email.')
    setCurrentUser(account)
    return account
  },

  async signUp({ email, displayName }) {
    await delay()
    const cleanEmail = email.trim().toLowerCase()
    const account = updateDb((db) => {
      if (db.accounts.some((a) => a.email === cleanEmail)) {
        throw new ServiceError('invalid', 'Ya existe una cuenta con ese email.')
      }
      const created: AuthUser = { id: newId('user'), email: cleanEmail, displayName }
      db.accounts.push(created)
      db.users.push({ id: created.id, displayName, createdAt: new Date().toISOString() })
      return created
    })
    setCurrentUser(account)
    return account
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
    return loadDb()
      .items.filter((item) => item.type === 'found' && item.status === 'published')
      .filter((item) => !filters.category || item.category === filters.category)
      .filter((item) => !filters.city || normalize(item.city) === normalize(filters.city))
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
    const user = requireUser()
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
    const user = requireUser()
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
}
