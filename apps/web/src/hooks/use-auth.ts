import type { AuthUser } from '@finder/shared'
import { useEffect, useState } from 'react'
import { services } from '@/services'

/**
 * Quién tiene la sesión iniciada.
 *   const { user, loading } = useAuth()
 * `loading` es true el instante inicial en que todavía no se sabe si hay sesión.
 */
export function useAuth(): { user: AuthUser | null; loading: boolean } {
  const [state, setState] = useState<{ user: AuthUser | null; loading: boolean }>({
    user: services.getCurrentUser(),
    loading: true,
  })

  useEffect(() => services.onAuthChange((user) => setState({ user, loading: false })), [])

  return state
}
