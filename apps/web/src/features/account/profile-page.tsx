import {
  CheckCircle2,
  Handshake,
  LogOut,
  Mail,
  Package,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { useMyClaims } from './use-my-claims'
import { useMyItems } from './use-my-items'

export function ProfilePage() {
  const navigate = useNavigate()
  const currentUser = services.getCurrentUser()
  const { data: myItems, isLoading: loadingItems } = useMyItems()
  const { data: myClaims, isLoading: loadingClaims } = useMyClaims()

  const handleSignOut = async () => {
    try {
      await services.signOut()
      toast.success('Has cerrado sesión correctamente')
      navigate(paths.home)
    } catch {
      toast.error('Ocurrió un error al cerrar sesión')
    }
  }

  if (!currentUser) {
    return (
      <Empty className="my-12 py-12">
        <EmptyMedia>
          <UserIcon className="h-12 w-12 text-muted-foreground" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No has iniciado sesión</EmptyTitle>
          <EmptyDescription>
            Necesitas acceder a tu cuenta para consultar tu perfil personal.
          </EmptyDescription>
        </EmptyHeader>
        <Button asChild className="mt-4">
          <Link to={paths.login}>Iniciar sesión</Link>
        </Button>
      </Empty>
    )
  }

  const initials = currentUser.displayName
    ? currentUser.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Cabecera del perfil */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-sm">
            <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {currentUser.displayName}
              </h1>
              <Badge variant="secondary" className="gap-1 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Cuenta Verificada
              </Badge>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
              <Mail className="h-4 w-4" />
              {currentUser.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </div>

      {/* Resumen de estadísticas rápidas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-all hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mis Publicaciones</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingItems ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{myItems?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Objetos que has encontrado o perdido y publicado en la plataforma.
            </p>
            <Button asChild variant="secondary" size="sm" className="w-full gap-2">
              <Link to={paths.myItems}>
                Ver mis publicaciones
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:border-primary/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mis Reclamaciones</CardTitle>
            <Handshake className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingClaims ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{myClaims?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Solicitudes para recuperar objetos que son tuyos.
            </p>
            <Button asChild variant="secondary" size="sm" className="w-full gap-2">
              <Link to={paths.myClaims}>
                Ver mis reclamaciones
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Información detallada de la cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalles de la cuenta</CardTitle>
          <CardDescription>
            Información personal y de contacto asociada a tu usuario.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">Nombre completo</span>
              <p className="text-sm font-semibold">{currentUser.displayName}</p>
            </div>

            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">Correo electrónico</span>
              <p className="text-sm font-semibold">{currentUser.email}</p>
            </div>

            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">Identificador de usuario</span>
              <p className="text-xs font-mono font-semibold text-muted-foreground">{currentUser.id}</p>
            </div>

            <div className="space-y-1 rounded-lg border p-3">
              <span className="text-xs font-medium text-muted-foreground">Estado de la cuenta</span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                Activa y en buen estado
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
