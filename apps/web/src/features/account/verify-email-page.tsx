import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, RotateCw, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { DemoHint } from '@/components/demo-hint'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/routes/paths'
import { ServiceError, services } from '@/services'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() =>
    code ? 'loading' : 'error',
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<ServiceError['code'] | null>(null)
  const [isResending, setIsResending] = useState(false)

  const [retryTrigger, setRetryTrigger] = useState(0)

  useEffect(() => {
    if (!code) return

    let isMounted = true

    services
      .verifyEmail(code)
      .then(() => {
        if (isMounted) setStatus('success')
      })
      .catch((err: unknown) => {
        if (!isMounted) return
        if (err instanceof ServiceError) {
          setErrorCode(err.code)
          setErrorMessage(err.message)
        } else {
          setErrorMessage('El enlace de verificación no es válido o ha expirado.')
        }
        setStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [code, retryTrigger])

  const handleRetry = () => {
    setStatus('loading')
    setErrorMessage(null)
    setErrorCode(null)
    setRetryTrigger((prev) => prev + 1)
  }

  const handleResendLink = async () => {
    setIsResending(true)
    try {
      await services.sendEmailVerification()
      toast.success('Nuevo enlace enviado', {
        description: 'Revisa tu bandeja de entrada o la carpeta de spam.',
      })
      navigate(paths.verifyEmailPending)
    } catch (err) {
      if (err instanceof ServiceError) {
        toast.error(err.message)
      } else {
        toast.error('No se pudo enviar un nuevo enlace de verificación.')
      }
    } finally {
      setIsResending(false)
    }
  }

  // 1. Sin código en la URL
  if (!code) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-8">
        <div className="w-full space-y-4">
          <Card className="w-full text-center">
            <CardHeader className="flex flex-col items-center pb-2">
              <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Este enlace no es válido</CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                No hemos podido encontrar el código de verificación en este enlace. Es posible que esté incompleto o que se haya copiado mal.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild className="w-full">
                <Link to={paths.login}>Ir a Entrar</Link>
              </Button>
            </CardContent>
          </Card>
          <DemoHint className="pt-2" />
        </div>
      </div>
    )
  }

  // 2. Cargando (Skeleton)
  if (status === 'loading') {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-8">
        <Card className="w-full">
          <CardHeader className="flex flex-col items-center space-y-3 pb-2 text-center">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // 3. Error
  if (status === 'error') {
    const isNetwork = errorCode === 'network'
    const isExpired = errorCode === 'expired'
    const isAlreadyUsed = errorCode === 'already-used'

    const title = isNetwork
      ? 'Error de conexión'
      : isExpired
        ? 'Enlace caducado'
        : isAlreadyUsed
          ? 'Enlace ya utilizado'
          : 'Enlace no válido'

    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-8">
        <div className="w-full space-y-4">
          <Card className="w-full">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Verificación de email</CardTitle>
              <CardDescription>
                Ha ocurrido un inconveniente al comprobar tu cuenta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>{title}</AlertTitle>
                <AlertDescription>
                  {errorMessage ?? 'El enlace de verificación no es válido o ha expirado.'}
                </AlertDescription>
                <AlertAction>
                  {isNetwork ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="gap-1.5"
                    >
                      <RotateCw className="size-3.5" />
                      Reintentar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendLink}
                      disabled={isResending}
                      className="gap-1.5"
                    >
                      <RotateCw className="size-3.5" />
                      Reenviar enlace
                    </Button>
                  )}
                </AlertAction>
              </Alert>

              <div className="text-center text-sm">
                <Link
                  to={paths.login}
                  className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                  Volver a la página de inicio de sesión
                </Link>
              </div>
            </CardContent>
          </Card>
          <DemoHint className="pt-2" />
        </div>
      </div>
    )
  }

  // 4. Éxito
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-8">
      <div className="w-full space-y-4">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Email verificado</CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Tu correo electrónico ha sido confirmado con éxito. Ya puedes utilizar Finder al completo para publicar o reclamar objetos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild className="w-full">
              <Link to={paths.home}>Empezar a usar Finder</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card secundaria: ofrecer verificación de identidad */}
        <Card className="border-dashed bg-muted/20 text-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">¿Quieres dejarlo todo listo?</CardTitle>
            <CardDescription className="text-xs">
              Verifica tu identidad ahora y podrás reclamar objetos sin esperas cuando los encuentres.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button variant="outline" asChild className="w-full gap-2 text-xs">
              <Link to={paths.verifyIdentity}>
                <ShieldCheck className="size-3.5 text-primary" />
                Verificar identidad
              </Link>
            </Button>
          </CardContent>
        </Card>

        <DemoHint className="pt-2" />
      </div>
    </div>
  )
}
