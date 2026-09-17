import type { AuthUser, Claim, Item, ItemPrivateDetails, User } from '@finder/shared'
import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { ServiceError, type Services } from '../types'

// Implementación REAL contra Firebase. Cumple el mismo contrato que ./mock.
// No se usa hasta que VITE_USE_MOCKS=false. Las fechas se guardan como texto ISO,
// igual que en los tipos, así no hay que convertir nada.
//
// Estructura en Firestore:
//   users/{userId}                      perfil público
//   items/{itemId}                      parte pública del objeto
//   items/{itemId}/private/details      detalles ocultos (solo quien publicó)
//   claims/{itemId}_{claimantId}        una reclamación por persona y objeto

function toAuthUser(user: FirebaseUser): AuthUser {
  return {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    ...(user.photoURL ? { photoURL: user.photoURL } : {}),
  }
}

function requireUser(): AuthUser {
  if (!auth.currentUser) {
    throw new ServiceError('not-signed-in', 'Tienes que entrar en tu cuenta para hacer esto.')
  }
  return toAuthUser(auth.currentUser)
}

const authMessages: Record<string, string> = {
  'auth/invalid-credential': 'El email o la contraseña no son correctos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña es demasiado corta.',
  'auth/invalid-email': 'Ese email no es válido.',
}

function toServiceError(error: unknown): never {
  if (error instanceof ServiceError) throw error
  if (error instanceof FirebaseError) {
    if (error.code === 'permission-denied') {
      throw new ServiceError('not-allowed', 'No tienes permiso para hacer esto.')
    }
    const message = authMessages[error.code]
    if (message) throw new ServiceError('invalid', message)
  }
  throw error
}

const newestFirst = (a: { createdAt: string }, b: { createdAt: string }) =>
  b.createdAt.localeCompare(a.createdAt)

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const claimId = (itemId: string, claimantId: string) => `${itemId}_${claimantId}`

export const services: Services = {
  getCurrentUser() {
    return auth.currentUser ? toAuthUser(auth.currentUser) : null
  },

  onAuthChange(listener) {
    return onAuthStateChanged(auth, (user) => listener(user ? toAuthUser(user) : null))
  },

  async signIn(email, password) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      return toAuthUser(credential.user)
    } catch (error) {
      return toServiceError(error)
    }
  },

  async signUp({ email, password, displayName }) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName })
      const profile: User = {
        id: credential.user.uid,
        displayName,
        createdAt: new Date().toISOString(),
      }
      await setDoc(doc(db, 'users', profile.id), profile)
      return toAuthUser(credential.user)
    } catch (error) {
      return toServiceError(error)
    }
  },

  async signOut() {
    await firebaseSignOut(auth)
  },

  async getUser(id) {
    const snapshot = await getDoc(doc(db, 'users', id))
    return snapshot.exists() ? (snapshot.data() as User) : null
  },

  async getItems(filters = {}) {
    const constraints: QueryConstraint[] = [
      where('type', '==', 'found'),
      where('status', '==', 'published'),
    ]
    if (filters.category) constraints.push(where('category', '==', filters.category))
    if (filters.city) constraints.push(where('city', '==', filters.city))
    constraints.push(orderBy('createdAt', 'desc'))

    const snapshot = await getDocs(query(collection(db, 'items'), ...constraints))
    const items = snapshot.docs.map((d) => d.data() as Item)

    // Firestore no sabe buscar texto libre: se filtra aquí. Suficiente mientras haya pocos
    // objetos; cuando crezca habrá que usar un buscador externo (ver docs/DECISIONES.md).
    const text = filters.query ? normalize(filters.query) : ''
    if (!text) return items
    return items.filter((item) =>
      normalize(`${item.title} ${item.description} ${item.locationText}`).includes(text),
    )
  },

  async getItem(id) {
    const snapshot = await getDoc(doc(db, 'items', id))
    return snapshot.exists() ? (snapshot.data() as Item) : null
  },

  async getMyItems() {
    const user = requireUser()
    const snapshot = await getDocs(
      query(collection(db, 'items'), where('createdBy', '==', user.id)),
    )
    return snapshot.docs.map((d) => d.data() as Item).sort(newestFirst)
  },

  async createItem(input) {
    const user = requireUser()
    const { hiddenDetails, ...publicPart } = input
    const ref = doc(collection(db, 'items'))
    const now = new Date().toISOString()
    const item: Item = {
      ...publicPart,
      id: ref.id,
      status: 'published',
      createdBy: user.id,
      createdByName: user.displayName,
      createdAt: now,
      updatedAt: now,
    }
    const details: ItemPrivateDetails = { hiddenDetails }
    try {
      const batch = writeBatch(db)
      batch.set(ref, item)
      batch.set(doc(db, 'items', ref.id, 'private', 'details'), details)
      await batch.commit()
      return item
    } catch (error) {
      return toServiceError(error)
    }
  },

  async getItemHiddenDetails(itemId) {
    requireUser()
    try {
      const snapshot = await getDoc(doc(db, 'items', itemId, 'private', 'details'))
      return snapshot.exists() ? (snapshot.data() as ItemPrivateDetails).hiddenDetails : ''
    } catch (error) {
      return toServiceError(error)
    }
  },

  async markItemReturned(itemId) {
    requireUser()
    try {
      await updateDoc(doc(db, 'items', itemId), {
        status: 'returned',
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      toServiceError(error)
    }
  },

  async createClaim({ itemId, proof }) {
    const user = requireUser()
    const item = await this.getItem(itemId)
    if (!item) throw new ServiceError('not-found', 'Este objeto ya no existe.')
    if (item.createdBy === user.id) {
      throw new ServiceError('not-allowed', 'No puedes reclamar un objeto que has publicado tú.')
    }
    if (item.status !== 'published') {
      throw new ServiceError('not-allowed', 'Este objeto ya no admite reclamaciones.')
    }
    const claim: Claim = {
      id: claimId(itemId, user.id),
      itemId,
      itemTitle: item.title,
      itemOwnerId: item.createdBy,
      claimantId: user.id,
      claimantContact: { name: user.displayName, email: user.email },
      proof,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    try {
      // Las reglas solo dejan CREAR este documento, no sobrescribirlo:
      // si ya existía, es que esta persona ya había reclamado el objeto.
      await setDoc(doc(db, 'claims', claim.id), claim)
      return claim
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'permission-denied') {
        throw new ServiceError('invalid', 'Ya has reclamado este objeto.')
      }
      return toServiceError(error)
    }
  },

  async getMyClaims() {
    const user = requireUser()
    const snapshot = await getDocs(
      query(collection(db, 'claims'), where('claimantId', '==', user.id)),
    )
    return snapshot.docs.map((d) => d.data() as Claim).sort(newestFirst)
  },

  async getClaimsOnMyItems() {
    const user = requireUser()
    const snapshot = await getDocs(
      query(collection(db, 'claims'), where('itemOwnerId', '==', user.id)),
    )
    return snapshot.docs.map((d) => d.data() as Claim).sort(newestFirst)
  },

  async resolveClaim(id, status) {
    const user = requireUser()
    const claimRef = doc(db, 'claims', id)
    const snapshot = await getDoc(claimRef)
    if (!snapshot.exists()) throw new ServiceError('not-found', 'Esta reclamación ya no existe.')
    const claim = snapshot.data() as Claim
    if (claim.status !== 'pending') {
      throw new ServiceError('invalid', 'Esta reclamación ya está respondida.')
    }
    const now = new Date().toISOString()
    try {
      const batch = writeBatch(db)
      if (status === 'accepted') {
        batch.update(claimRef, {
          status,
          resolvedAt: now,
          ownerContact: { name: user.displayName, email: user.email },
        })
        batch.update(doc(db, 'items', claim.itemId), { status: 'claimed', updatedAt: now })
      } else {
        batch.update(claimRef, { status, resolvedAt: now })
      }
      await batch.commit()
    } catch (error) {
      toServiceError(error)
    }
  },
}
