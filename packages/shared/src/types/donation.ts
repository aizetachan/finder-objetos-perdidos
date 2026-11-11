import type { CategoryId } from '../categories'
import type { Contact } from './claim'

// DONACIONES: objetos que alguien regala. Definición en docs/PRODUCTO.md, punto 5.
// Van en sus propias colecciones (`donations` y `donationRequests`), separadas de los
// objetos encontrados, para que nada de lo que ya funciona cambie.

// Estado de conservación del objeto. Lista fija, igual que las categorías.
export const DONATION_CONDITIONS = [
  { id: 'like_new', label: 'Como nuevo' },
  { id: 'good', label: 'Buen estado' },
  { id: 'used_functional', label: 'Usado pero funcional' },
] as const

export type DonationCondition = (typeof DONATION_CONDITIONS)[number]['id']

export const DONATION_CONDITION_IDS = DONATION_CONDITIONS.map((condition) => condition.id) as [
  DonationCondition,
  ...DonationCondition[],
]

export function getDonationConditionLabel(id: DonationCondition): string {
  return DONATION_CONDITIONS.find((condition) => condition.id === id)?.label ?? id
}

// 'direct' = alguien regala algo suyo.
// 'unclaimed_found' = objeto encontrado que nadie reclamó y quien lo encontró decide donarlo.
export type DonationOrigin = 'direct' | 'unclaimed_found'

// disponible → reservado (quien dona ha elegido a una persona) → donado (ya entregado)
export type DonationStatus = 'available' | 'reserved' | 'donated'

// Colección `donations`. Todo es PÚBLICO: en una donación no hay detalles ocultos.
export interface Donation {
  id: string
  origin: DonationOrigin
  // Solo si origin === 'unclaimed_found': el objeto encontrado del que viene.
  sourceItemId?: string
  title: string
  description: string
  category: CategoryId
  condition: DonationCondition
  photos: string[]
  city: string
  locationText: string // zona aproximada: "Cerca de la estación de tren"
  deliveryNotes?: string // indicaciones para la entrega en persona
  status: DonationStatus
  createdBy: string // id de quien dona
  createdByName: string
  createdAt: string
  updatedAt: string
}

// Lo que rellena una persona al publicar una donación directa. El resto lo pone el sistema.
export interface NewDonationInput {
  title: string
  description: string
  category: CategoryId
  condition: DonationCondition
  photos: string[]
  city: string
  locationText: string
  deliveryNotes?: string
}

// Filtros del catálogo de donaciones. Todos son opcionales.
export interface DonationFilters {
  category?: CategoryId
  city?: string
}

// pendiente → aceptada (la persona elegida) o no seleccionada
export type DonationRequestStatus = 'pending' | 'accepted' | 'not_selected'

// Colección `donationRequests`: alguien dice "me vendría bien este objeto".
// Solo la pueden leer las dos partes: quien solicita y quien dona.
export interface DonationRequest {
  id: string
  donationId: string
  donationTitle: string
  donorId: string // quien dona
  requesterId: string // quien solicita
  requesterName: string
  message: string // por qué le vendría bien
  // Quien solicita comparte su contacto desde el principio con quien dona.
  requesterContact: Contact
  // Quien dona solo comparte el suyo cuando ACEPTA la solicitud.
  donorContact?: Contact
  status: DonationRequestStatus
  createdAt: string
  resolvedAt?: string
}

export interface NewDonationRequestInput {
  donationId: string
  message: string
}
