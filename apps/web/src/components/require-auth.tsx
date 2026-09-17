import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { paths } from '@/routes/paths'

// Envuelve las pantallas que necesitan cuenta. Si no hay sesión, manda a /login
// y recuerda de dónde venía la persona para devolverla ahí después de entrar.
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Skeleton className="h-40 w-full" />
  if (!user) return <Navigate to={paths.login} state={{ from: location.pathname }} replace />
  return children
}
