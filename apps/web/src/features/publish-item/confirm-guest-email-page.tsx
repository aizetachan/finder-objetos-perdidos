import { useEffect, useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, LogIn, RotateCw } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { ServiceError } from '@/services/types'

export function ConfirmGuestEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code') ?? 'mock-code'

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<ServiceError | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await services.confirmGuestEmail(code)
      setIsSuccess(true)
      toast.success('Email confirmado correctamente')
      navigate(paths.publish, { replace: true })
    } catch (err) {
      if (err instanceof ServiceError) {
        setError(err)
      } else {
        setError(
          new ServiceError(
            'network',
            'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
          ),
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void handleConfirm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="size-6 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Confirmando tu email
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Estamos comprobando tu enlace para que puedas publicar el objeto encontrado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    const isAccountExists = error.code === 'already-exists'

    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isAccountExists ? 'Este email ya tiene cuenta' : 'No se pudo confirmar el email'}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              {isAccountExists
                ? 'Ya existe una cuenta registrada con este correo electrónico. Inicia sesión para publicar tu objeto.'
                : error.message}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="size-4" />
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              {isAccountExists ? (
                <Button asChild className="w-full gap-2">
                  <Link to={paths.login}>
                    <LogIn className="size-4" />
                    Iniciar sesión
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={() => void handleConfirm()}
                >
                  <RotateCw className="size-4" />
                  Reintentar
                </Button>
              )}

              <Button asChild variant="outline" className="w-full gap-2">
                <Link to={paths.publish}>
                  <ArrowLeft className="size-4" />
                  Volver al formulario de publicación
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              ¡Email confirmado!
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Redirigiendo al formulario para publicar tu objeto...
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button asChild className="w-full">
              <Link to={paths.publish}>Continuar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
