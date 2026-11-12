import type { DonationFilters, ItemFilters } from '@finder/shared'

// Nombres de las "cajas" donde TanStack Query guarda los datos ya pedidos.
// Se usan al pedir datos (useQuery) y al avisar de que han cambiado (invalidateQueries).
export const queryKeys = {
  items: (filters?: ItemFilters) => ['items', filters ?? {}] as const,
  allItems: ['items'] as const,
  item: (id: string) => ['item', id] as const,
  itemHiddenDetails: (id: string) => ['item', id, 'hidden-details'] as const,
  myItems: ['my-items'] as const,
  myClaims: ['my-claims'] as const,
  claimsOnMyItems: ['claims-on-my-items'] as const,
  user: (id: string) => ['user', id] as const,
  donations: (filters?: DonationFilters) => ['donations', filters ?? {}] as const,
  allDonations: ['donations'] as const,
  donation: (id: string) => ['donation', id] as const,
  myDonations: ['my-donations'] as const,
  myDonationRequests: ['my-donation-requests'] as const,
  requestsOnMyDonations: ['requests-on-my-donations'] as const,
}
