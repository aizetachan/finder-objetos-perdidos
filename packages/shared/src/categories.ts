// Categorías de objetos. Es una lista fija en el código, no una colección.
// Para añadir una: añade una línea aquí y ya aparece en toda la web.
export const CATEGORIES = [
  { id: 'electronics', label: 'Electrónica' },
  { id: 'documents', label: 'Documentos' },
  { id: 'keys', label: 'Llaves' },
  { id: 'wallets-bags', label: 'Carteras y bolsos' },
  { id: 'clothing', label: 'Ropa y complementos' },
  { id: 'jewelry', label: 'Joyas y relojes' },
  { id: 'glasses', label: 'Gafas' },
  { id: 'toys', label: 'Juguetes' },
  { id: 'sports', label: 'Deporte' },
  { id: 'other', label: 'Otros' },
] as const

export type CategoryId = (typeof CATEGORIES)[number]['id']

export const CATEGORY_IDS = CATEGORIES.map((category) => category.id) as [CategoryId, ...CategoryId[]]

export function getCategoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id
}
