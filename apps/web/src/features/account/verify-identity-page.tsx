import { useEffect, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  IdCard,
  Loader2,
  RotateCw,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'
import { DemoHint } from '@/components/demo-hint'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { paths } from '@/routes/paths'
import { ServiceError, services } from '@/services'

type DocumentType = 'dni' | 'passport'
type WizardStep = 'intro' | 'document' | 'verifying' | 'success' | 'rejected'

function getSafeReturnUrl(rawUrl: string | null): string {
  if (rawUrl && rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
    return rawUrl
  }
  return paths.profile
}

function getSafeDismissUrl(rawUrl: string | null): string {
  if (rawUrl && rawUrl.startsWith('/') && !rawUrl.startsWith('//')) {
    return rawUrl
  }
  return paths.home
}

export function VerifyIdentityPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnParam = searchParams.get('volver')
  const { user } = useAuth()

  // Si la persona ya está verificada previamente, mostrar directamente el resultado correcto
  const initialStep: WizardStep =
    user?.identityStatus === 'verified'
      ? 'success'
      : user?.identityStatus === 'pending'
        ? 'verifying'
        : 'intro'

  const [step, setStep] = useState<WizardStep>(initialStep)
  const [selectedDoc, setSelectedDoc] = useState<DocumentType>('dni')
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isTimedOut, setIsTimedOut] = useState(false)

  // Polling automático durante el paso 'verifying' (cada 2s, máx 30s)
  useEffect(() => {
    if (step !== 'verifying') return

    let mounted = true
    let elapsedMs = 0
    const intervalMs = 2000
    const maxMs = 30000

    const timer = setInterval(async () => {
      elapsedMs += intervalMs
      try {
        const currentStatus = await services.getIdentityStatus()
        if (!mounted) return

        if (currentStatus === 'verified') {
          clearInterval(timer)
          setStep('success')
          return
        }
        if (currentStatus === 'rejected') {
          clearInterval(timer)
          setStep('rejected')
          return
        }

        if (elapsedMs >= maxMs) {
          clearInterval(timer)
          setIsTimedOut(true)
        }
      } catch {
        // En caso de fallo transitorio, sigue intentando en el siguiente intervalo
      }
    }, intervalMs)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [step])

  const handleStartVerification = async () => {
    setIsLoading(true)
    setServerError(null)
    setIsTimedOut(false)
    try {
      await services.startIdentityVerification(selectedDoc)
      setStep('verifying')
    } catch (err) {
      if (err instanceof ServiceError && err.code === 'network') {
        setServerError(err.message)
        return
      }
      setServerError('No hemos podido conectar con el servicio de verificación. Comprueba tu conexión.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
      <div className="w-full space-y-6">
        <Card className="w-full">
        {/* PASO 1: INTRO / POR QUÉ LO PEDIMOS */}
        {step === 'intro' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Verifica tu identidad</CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                En Finder solo se puede reclamar un objeto con identidad verificada, para proteger a quien lo encontró y a su dueño.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <ul className="space-y-3.5 rounded-lg border bg-muted/20 p-4 text-sm text-foreground">
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>Tardas unos 2 minutos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>Necesitas tu DNI o pasaporte y la cámara del móvil.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    Finder no guarda la foto de tu documento: solo sabemos si la verificación es correcta (cumplimiento RGPD).
                  </span>
                </li>
              </ul>

              <div className="flex flex-col gap-2.5">
                <Button className="w-full" onClick={() => setStep('document')}>
                  Empezar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => navigate(getSafeDismissUrl(returnParam))}
                >
                  Ahora no
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* PASO 2: ELEGIR DOCUMENTO */}
        {step === 'document' && (
          <>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">Elige tu documento</CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                Selecciona qué documento oficial vas a utilizar para la comprobación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {serverError && (
                <Alert variant="destructive">
                  <AlertTitle>Ha ocurrido un problema</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                  <AlertAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleStartVerification}
                      className="gap-1.5"
                    >
                      <RotateCw className="size-3.5" />
                      Reintentar
                    </Button>
                  </AlertAction>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc('dni')}
                  className={`flex flex-col items-center gap-2.5 rounded-lg border p-4 text-center transition-all ${
                    selectedDoc === 'dni'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <IdCard className="size-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">DNI</p>
                    <p className="text-xs text-muted-foreground">Documento de identidad</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDoc('passport')}
                  className={`flex flex-col items-center gap-2.5 rounded-lg border p-4 text-center transition-all ${
                    selectedDoc === 'passport'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <BookOpen className="size-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Pasaporte</p>
                    <p className="text-xs text-muted-foreground">Cualquier país</p>
                  </div>
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button
                  className="w-full"
                  disabled={isLoading}
                  onClick={handleStartVerification}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Iniciando sesión segura...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setStep('intro')}
                >
                  Atrás
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* PASO 3: VERIFICACIÓN EN CURSO */}
        {step === 'verifying' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Comprobando tu documento…</CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                La comprobación está en curso en el proveedor oficial. Tardará unos segundos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              {isTimedOut && (
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertTitle>Está tardando más de lo habitual</AlertTitle>
                  <AlertDescription>
                    La verificación continúa en segundo plano. Puedes comprobar el resultado ahora o volver a consultar tu estado más tarde en tu perfil.
                  </AlertDescription>
                  <AlertAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsTimedOut(false)
                        void services.getIdentityStatus().then((res) => {
                          if (res === 'verified') setStep('success')
                          else if (res === 'rejected') setStep('rejected')
                        })
                      }}
                      className="gap-1.5"
                    >
                      <RotateCw className="size-3.5" />
                      Comprobar ahora
                    </Button>
                  </AlertAction>
                </Alert>
              )}

              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => navigate(getSafeDismissUrl(returnParam))}
              >
                Volver más tarde
              </Button>
            </CardContent>
          </>
        )}

        {/* RESULTADO: CORRECTA */}
        {step === 'success' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Identidad verificada</CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                Tu documento ha sido comprobado con éxito. Ya puedes reclamar objetos en Finder.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Button
                className="w-full"
                onClick={() => navigate(getSafeReturnUrl(returnParam))}
              >
                Continuar
              </Button>
            </CardContent>
          </>
        )}

        {/* RESULTADO: FALLIDA */}
        {step === 'rejected' && (
          <>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">No hemos podido verificar tu identidad</CardTitle>
              <CardDescription className="text-base text-muted-foreground pt-1">
                El sistema de comprobación no ha podido validar tu documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <Alert variant="destructive">
                <AlertTitle>Motivos habituales</AlertTitle>
                <AlertDescription>
                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs">
                    <li>La foto del documento está borrosa o desenfocada.</li>
                    <li>Hay reflejos o sombras que tapan datos importantes.</li>
                    <li>El documento está caducado o no se encuentra en vigor.</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-2.5">
                <Button className="w-full" onClick={() => setStep('document')}>
                  Intentarlo de nuevo
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => navigate(getSafeDismissUrl(returnParam))}
                >
                  Volver a la portada
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <DemoHint className="pt-2" />
      </div>
    </div>
  )
}
