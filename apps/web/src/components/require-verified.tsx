import type { ReactNode } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Mail,
  RotateCw,
  ShieldCheck,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useResendVerificationEmail } from '@/features/account/use-resend-verification-email'
import { useAuth } from '@/hooks/use-auth'
import { paths } from '@/routes/paths'

interface RequireVerifiedProps {
  children: ReactNode
  need: 'publish' | 'claim'
}

/**
 * Guardián de rutas que verifica si la persona cumple los requisitos
 * necesarios para publicar (email verificado) o reclamar (email + identidad verificada).
 */
export function RequireVerified({ children, need }: RequireVerifiedProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { countdown, isResending, resend } = useResendVerificationEmail()

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  if (!user) {
    return null
  }

  // 1. Falta verificar el email (común para publicar y reclamar)
  if (!user.emailVerified) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Verifica tu email para continuar
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Te enviamos un enlace a <span className="font-semibold text-foreground">{user.email}</span>. Revisa también spam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void resend()}
              disabled={countdown > 0 || isResending}
            >
              {countdown > 0 ? (
                <>
                  <Clock className="mr-2 size-4" />
                  Reenviar en {countdown} s
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 size-4" />
                  Reenviar email
                </>
              )}
            </Button>

            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="size-3.5" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 2. Cuenta de invitado: debe completar su registro para poder reclamar
  if (need === 'claim' && user.isGuest) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Completa tu cuenta para reclamar
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Tienes una cuenta de invitado. Para proteger a quien encontró el objeto y poder reclamarlo, completa tu registro y verifica tu identidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button asChild className="w-full">
              <Link to={`${paths.completeAccount}?volver=${encodeURIComponent(location.pathname)}`}>
                Completar mi cuenta
              </Link>
            </Button>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="size-3.5" />
                Volver al objeto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 3. Falta verificar identidad (solo para 'claim')
  if (need === 'claim' && user.identityStatus !== 'verified') {
    const returnUrl = encodeURIComponent(location.pathname)

    // Estado 'pending': comprobación en curso
    if (user.identityStatus === 'pending') {
      return (
        <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
          <Card className="w-full text-center">
            <CardHeader className="flex flex-col items-center pb-2">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Clock className="size-6 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Estamos comprobando tu identidad
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                La comprobación de tu documento está en proceso en el proveedor oficial. En cuanto finalice, podrás reclamar este objeto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="space-y-2 py-2">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
              <Button asChild className="w-full">
                <Link to={`${paths.verifyIdentity}?volver=${returnUrl}`}>
                  Ver estado
                </Link>
              </Button>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="size-3.5" />
                  Volver al objeto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Estado 'rejected': verificación previa fallida
    const isRejected = user.identityStatus === 'rejected'

    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div
              className={`mb-3 flex size-12 items-center justify-center rounded-full ${
                isRejected
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {isRejected ? (
                <AlertCircle className="size-6" />
              ) : (
                <ShieldCheck className="size-6" />
              )}
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Verifica tu identidad para reclamar
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              {isRejected
                ? 'La última verificación no fue correcta. Puedes intentarlo de nuevo. Para proteger a quien encontró el objeto, solo pueden reclamar personas con identidad verificada. Tardas unos 2 minutos y Finder no guarda la foto de tu documento.'
                : 'Para proteger a quien encontró el objeto, solo pueden reclamar personas con identidad verificada. Tardas unos 2 minutos y Finder no guarda la foto de tu documento.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button asChild className="w-full gap-2">
              <Link to={`${paths.verifyIdentity}?volver=${returnUrl}`}>
                <ShieldCheck className="size-4" />
                Verificar identidad
              </Link>
            </Button>
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="size-3.5" />
                Volver al objeto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Cumple todos los requisitos
  return <>{children}</>
}
