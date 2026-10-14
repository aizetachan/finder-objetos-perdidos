import type { ClaimStatus } from '@finder/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { services } from '@/services'
import { queryKeys } from '@/services/query-keys'

export function useClaimsOnMyItems() {
  return useQuery({
    queryKey: queryKeys.claimsOnMyItems,
    queryFn: () => services.getClaimsOnMyItems(),
  })
}

export function useResolveClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      claimId,
      status,
    }: {
      claimId: string
      status: Exclude<ClaimStatus, 'pending'>
    }) => services.resolveClaim(claimId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.claimsOnMyItems })
      queryClient.invalidateQueries({ queryKey: queryKeys.myItems })
      queryClient.invalidateQueries({ queryKey: queryKeys.allItems })
    },
  })
}
