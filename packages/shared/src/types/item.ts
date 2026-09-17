import type { CategoryId } from '../categories'

// 'found' = alguien lo ha encontrado. 'lost' = alguien lo ha perdido (fuera de la fase 1).
export type ItemType = 'found' | 'lost'

// publicado → con una reclamación aceptada → devuelto a su dueño
export type ItemStatus = 'published' | 'claimed' | 'returned'

// Colección `items`: la parte PÚBLICA de un objeto.
export interface Item {
  id: string
  type: ItemType
  title: string
  description: string
  category: CategoryId
  photos: string[]
  city: string
  locationText: string // zona aproximada: "Parque del Retiro, cerca del estanque"
  date: string // cuándo se encontró (ISO)
  status: ItemStatus
  createdBy: string // id del usuario que lo publicó
  createdByName: string
  createdAt: string
  updatedAt: string
}

// Documento `items/{id}/private/details`: solo lo puede leer quien publicó el objeto.
// Va aparte porque las reglas de Firestore protegen documentos enteros, no campos sueltos.
export interface ItemPrivateDetails {
  hiddenDetails: string
}

// Lo que rellena una persona al publicar. El resto de campos los pone el sistema.
export interface NewItemInput {
  type: ItemType
  title: string
  description: string
  category: CategoryId
  photos: string[]
  city: string
  locationText: string
  date: string
  hiddenDetails: string
}

// Filtros del buscador. Todos son opcionales.
export interface ItemFilters {
  query?: string
  category?: CategoryId
  city?: string
}
