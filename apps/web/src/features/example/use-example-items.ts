import type { ItemFilters, NewItemInput } from '@finder/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { services } from '@/services'
import { queryKeys } from '@/services/query-keys'

// PEDIR datos: useQuery. Devuelve { data, isPending, isError, refetch… }.
export function useItems(filters?: ItemFilters) {
  return useQuery({
    queryKey: queryKeys.items(filters),
    queryFn: () => services.getItems(filters),
  })
}

// CAMBIAR datos: useMutation. Al terminar bien, avisa de que las listas de objetos
// han cambiado para que se vuelvan a pedir solas.
export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: NewItemInput) => services.createItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allItems })
      queryClient.invalidateQueries({ queryKey: queryKeys.myItems })
    },
  })
}
