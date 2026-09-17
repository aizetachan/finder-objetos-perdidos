import type { Services } from './types'

// Interruptor entre datos de ejemplo y Firebase. Por defecto, datos de ejemplo:
// solo se usa Firebase si en el archivo .env pone exactamente VITE_USE_MOCKS=false.
export const usingMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

// Solo se carga la implementación que se usa (la otra ni se descarga).
const implementation: { services: Services } = usingMocks
  ? await import('./mock')
  : await import('./firebase')

/**
 * La ÚNICA puerta de entrada a los datos. Las pantallas hacen `services.getItems()`, etc.
 * Nunca importan Firebase ni los datos de ejemplo directamente.
 */
export const services = implementation.services

export { ServiceError } from './types'
export type { Services } from './types'
