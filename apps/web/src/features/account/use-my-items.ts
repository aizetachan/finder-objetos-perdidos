import { useQuery } from '@tanstack/react-query'
import { services } from '@/services'
import { queryKeys } from '@/services/query-keys'

export function useMyItems() {
  return useQuery({
    queryKey: queryKeys.myItems,
    queryFn: () => services.getMyItems(),
  })
}
