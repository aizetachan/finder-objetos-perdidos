import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { services } from '@/services'
import { queryKeys } from '@/services/query-keys'

export function useMyClaims() {
  return useQuery({
    queryKey: queryKeys.myClaims,
    queryFn: () => services.getMyClaims(),
  })
}

export function useCancelClaim() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (claimId: string) => services.cancelClaim(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.myClaims })
      queryClient.invalidateQueries({ queryKey: queryKeys.claimsOnMyItems })
    },
  })
}
