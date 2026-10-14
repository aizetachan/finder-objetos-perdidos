import { useQuery } from '@tanstack/react-query'
import { services } from '@/services'
import { queryKeys } from '@/services/query-keys'

export function useItemDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.item(id),
    queryFn: () => services.getItem(id),
    enabled: Boolean(id),
  })
}
