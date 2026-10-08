import type { ItemFilters } from '@finder/shared'
import { useQuery } from '@tanstack/react-query'
import { services } from '@/services'
import { queryKeys } from '@/services/query-keys'

export function useSearchItems(filters?: ItemFilters) {
  return useQuery({
    queryKey: queryKeys.items(filters),
    queryFn: () => services.getItems(filters),
  })
}
