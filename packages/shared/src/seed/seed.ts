import type { Claim } from '../types/claim'
import type { Item } from '../types/item'
import type { AuthUser, User } from '../types/user'
import { placeholderPhoto } from './placeholder'

// DATOS DE EJEMPLO. Es la única fuente de datos falsos del proyecto:
// alimenta los mocks de la web y (más adelante) los emuladores de Firebase.
// Son personas y objetos inventados.

export interface SeedData {
  accounts: AuthUser[] // cuentas con las que se puede "entrar" en modo de ejemplo
  users: User[]
  items: Item[]
  itemHiddenDetails: Record<string, string> // id del objeto → detalles ocultos
  claims: Claim[]
}

const photo = placeholderPhoto

export const seed: SeedData = {
  accounts: [
    { id: 'user-lucia', email: 'lucia@example.com', displayName: 'Lucía Martín' },
    { id: 'user-carlos', email: 'carlos@example.com', displayName: 'Carlos Ruiz' },
    { id: 'user-aina', email: 'aina@example.com', displayName: 'Aina Ferrer' },
    { id: 'user-mikel', email: 'mikel@example.com', displayName: 'Mikel Etxeberria' },
  ],
  users: [
    { id: 'user-lucia', displayName: 'Lucía Martín', city: 'Madrid', createdAt: '2026-08-01T09:00:00.000Z' },
    { id: 'user-carlos', displayName: 'Carlos Ruiz', city: 'Valencia', createdAt: '2026-08-03T09:00:00.000Z' },
    { id: 'user-aina', displayName: 'Aina Ferrer', city: 'Barcelona', createdAt: '2026-08-10T09:00:00.000Z' },
    { id: 'user-mikel', displayName: 'Mikel Etxeberria', city: 'Bilbao', createdAt: '2026-08-12T09:00:00.000Z' },
  ],
  items: [
    {
      id: 'item-wallet',
      type: 'found',
      title: 'Cartera marrón de piel',
      description: 'Cartera de piel marrón, algo gastada. Estaba en un banco.',
      category: 'wallets-bags',
      photos: [photo('Cartera')],
      city: 'Madrid',
      locationText: 'Parque del Retiro, cerca del estanque',
      date: '2026-09-10T17:30:00.000Z',
      status: 'published',
      createdBy: 'user-lucia',
      createdByName: 'Lucía Martín',
      createdAt: '2026-09-10T19:00:00.000Z',
      updatedAt: '2026-09-10T19:00:00.000Z',
    },
    {
      id: 'item-keys',
      type: 'found',
      title: 'Llaves con llavero rojo',
      description: 'Manojo de tres llaves con un llavero rojo de tela.',
      category: 'keys',
      photos: [photo('Llaves')],
      city: 'Valencia',
      locationText: 'Parada de metro Colón, andén dirección aeropuerto',
      date: '2026-09-12T08:15:00.000Z',
      status: 'published',
      createdBy: 'user-carlos',
      createdByName: 'Carlos Ruiz',
      createdAt: '2026-09-12T09:00:00.000Z',
      updatedAt: '2026-09-12T09:00:00.000Z',
    },
    {
      id: 'item-phone',
      type: 'found',
      title: 'Móvil negro con funda transparente',
      description: 'Móvil de pantalla grande, negro, con funda transparente. Está apagado.',
      category: 'electronics',
      photos: [photo('Móvil')],
      city: 'Barcelona',
      locationText: 'Playa de la Barceloneta, junto a las duchas',
      date: '2026-09-13T20:00:00.000Z',
      status: 'claimed',
      createdBy: 'user-aina',
      createdByName: 'Aina Ferrer',
      createdAt: '2026-09-13T21:30:00.000Z',
      updatedAt: '2026-09-15T10:00:00.000Z',
    },
    {
      id: 'item-glasses',
      type: 'found',
      title: 'Gafas de sol de pasta',
      description: 'Gafas de sol de pasta oscura dentro de una funda rígida.',
      category: 'glasses',
      photos: [photo('Gafas')],
      city: 'Madrid',
      locationText: 'Cercanías, tren Atocha – Chamartín',
      date: '2026-09-14T14:00:00.000Z',
      status: 'published',
      createdBy: 'user-lucia',
      createdByName: 'Lucía Martín',
      createdAt: '2026-09-14T16:00:00.000Z',
      updatedAt: '2026-09-14T16:00:00.000Z',
    },
    {
      id: 'item-backpack',
      type: 'found',
      title: 'Mochila azul de deporte',
      description: 'Mochila azul marino con ropa de deporte dentro.',
      category: 'sports',
      photos: [photo('Mochila')],
      city: 'Bilbao',
      locationText: 'Polideportivo de Deusto, vestuarios',
      date: '2026-09-15T19:00:00.000Z',
      status: 'published',
      createdBy: 'user-mikel',
      createdByName: 'Mikel Etxeberria',
      createdAt: '2026-09-15T20:00:00.000Z',
      updatedAt: '2026-09-15T20:00:00.000Z',
    },
    {
      id: 'item-watch',
      type: 'found',
      title: 'Reloj de pulsera plateado',
      description: 'Reloj plateado con correa metálica. Funciona.',
      category: 'jewelry',
      photos: [photo('Reloj')],
      city: 'Valencia',
      locationText: 'Jardín del Turia, zona de juegos del Gulliver',
      date: '2026-09-05T11:00:00.000Z',
      status: 'returned',
      createdBy: 'user-carlos',
      createdByName: 'Carlos Ruiz',
      createdAt: '2026-09-05T12:00:00.000Z',
      updatedAt: '2026-09-09T18:00:00.000Z',
    },
  ],
  itemHiddenDetails: {
    'item-wallet': 'Dentro hay un carnet de biblioteca a nombre de M. y la foto de un perro blanco.',
    'item-keys': 'Una de las llaves tiene una funda de goma verde. El llavero pone "Peñíscola".',
    'item-phone': 'El fondo de pantalla de bloqueo es una montaña nevada. Tiene una pegatina de un gato por detrás.',
    'item-glasses': 'La funda es granate y dentro hay una gamuza con el nombre de una óptica de Toledo.',
    'item-backpack': 'Dentro hay unas zapatillas del 43 y una toalla amarilla.',
    'item-watch': 'Por detrás tiene grabado "25 años".',
  },
  claims: [
    {
      id: 'claim-phone',
      itemId: 'item-phone',
      itemTitle: 'Móvil negro con funda transparente',
      itemOwnerId: 'user-aina',
      claimantId: 'user-mikel',
      claimantContact: { name: 'Mikel Etxeberria', email: 'mikel@example.com' },
      ownerContact: { name: 'Aina Ferrer', email: 'aina@example.com' },
      proof: 'Tiene una pegatina de un gato en la parte de atrás y el fondo es una montaña con nieve.',
      status: 'accepted',
      createdAt: '2026-09-14T09:00:00.000Z',
      resolvedAt: '2026-09-15T10:00:00.000Z',
    },
    {
      id: 'claim-wallet',
      itemId: 'item-wallet',
      itemTitle: 'Cartera marrón de piel',
      itemOwnerId: 'user-lucia',
      claimantId: 'user-carlos',
      claimantContact: { name: 'Carlos Ruiz', email: 'carlos@example.com' },
      proof: 'Dentro llevo el carnet de la biblioteca y una foto de mi perro, que es blanco.',
      status: 'pending',
      createdAt: '2026-09-16T12:00:00.000Z',
    },
  ],
}
