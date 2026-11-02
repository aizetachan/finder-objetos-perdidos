import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  RotateCw,
  Sparkles,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { paths } from '@/routes/paths'
import { ServiceError, services } from '@/services'
import { passwordSchema } from './password-schema'

const completeAccountSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(50, 'El nombre no puede tener más de 50 caracteres.'),
  password: passwordSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y la política de privacidad para continuar.',
  }),
})

type CompleteAccountValues = z.infer<typeof completeAccountSchema>

function getSafeReturnUrl(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return paths.myItems
}

export function CompleteAccountPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')
  const rawVolver = searchParams.get('volver')
  const returnUrl = getSafeReturnUrl(rawVolver)

  const { user, loading: authLoading } = useAuth()
  const [isVerifyingLink, setIsVerifyingLink] = useState(Boolean(code && !user))
  const [linkError, setLinkError] = useState<ServiceError | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // 1. Si llega con código y no tiene sesión, validar el enlace
  useEffect(() => {
    if (!code || user || authLoading) return

    let active = true
    services
      .signInWithGuestLink(code)
      .catch((err) => {
        if (!active) return
        if (err instanceof ServiceError) {
          setLinkError(err)
        } else {
          setLinkError(
            new ServiceError(
              'network',
              'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
            ),
          )
        }
      })
      .finally(() => {
        if (active) setIsVerifyingLink(false)
      })

    return () => {
      active = false
    }
  }, [code, user, authLoading])

  const handleRetryCode = async () => {
    if (!code) return
    setIsVerifyingLink(true)
    setLinkError(null)
    try {
      await services.signInWithGuestLink(code)
    } catch (err) {
      if (err instanceof ServiceError) {
        setLinkError(err)
      } else {
        setLinkError(
          new ServiceError(
            'network',
            'No hemos podido conectar. Revisa tu conexión y vuelve a intentarlo.',
          ),
        )
      }
    } finally {
      setIsVerifyingLink(false)
    }
  }

  // 2. Si ya es una cuenta normal, redirigir
  useEffect(() => {
    if (!authLoading && user && !user.isGuest) {
      navigate(returnUrl, { replace: true })
    }
  }, [user, authLoading, navigate, returnUrl])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CompleteAccountValues>({
    resolver: zodResolver(completeAccountSchema),
    defaultValues: {
      displayName: user?.displayName && user.displayName !== 'Invitado' ? user.displayName : '',
      password: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (values: CompleteAccountValues) => {
    setSubmitError(null)
    try {
      await services.completeGuestAccount({
        displayName: values.displayName,
        password: values.password,
      })
      toast.success('¡Cuenta completada con éxito!')
      navigate(returnUrl, { replace: true, state: { tab: 'claims' } })
    } catch (err) {
      if (err instanceof ServiceError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('Ha ocurrido un error al completar la cuenta. Vuelve a intentarlo.')
      }
    }
  }

  if (authLoading || isVerifyingLink) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Loader2 className="size-6 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Comprobando tu enlace
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Un momento mientras validamos el acceso a tu publicación...
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

  // Error de enlace inválido o caducado
  if (linkError) {
    const isNetwork = linkError.code === 'network'

    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isNetwork ? 'Error de conexión' : 'Este enlace ya no es válido'}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              {isNetwork
                ? 'No hemos podido conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
                : 'Entra en tu email: te enviaremos uno nuevo cuando haya novedades sobre tu objeto.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {isNetwork ? (
              <Button
                type="button"
                className="w-full gap-2"
                onClick={() => void handleRetryCode()}
              >
                <RotateCw className="size-4" />
                Reintentar
              </Button>
            ) : null}
            <Button asChild variant="outline" className="w-full">
              <Link to={paths.home}>Ir al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sin sesión y sin código
  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Mail className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Enlace de acceso necesario
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Para completar tu cuenta usa el enlace que te enviamos por email cuando alguien reclama tu objeto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <Button asChild className="w-full gap-2">
              <Link to={paths.login}>
                <ArrowRight className="size-4" />
                Entrar en mi cuenta
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-muted-foreground">
              <Link to={paths.home}>Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Usuario con cuenta temporal listo para completar
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
      <Card className="w-full">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Completa tu cuenta
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground pt-1.5 leading-relaxed">
            Alguien ha reclamado un objeto que publicaste. Crea tu contraseña para ver la
            reclamación y responder. Mantendrás todo lo que has publicado.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="complete-account-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {submitError ? (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>No se pudo completar</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <FieldGroup>
              {/* Email (Confirmado y deshabilitado) */}
              <Field>
                <FieldLabel htmlFor="complete-email">Correo electrónico</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="complete-email"
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-9 bg-muted/50 cursor-not-allowed opacity-80"
                  />
                </div>
                <FieldDescription>
                  Tu email ya fue verificado al publicar el objeto.
                </FieldDescription>
              </Field>

              {/* Nombre */}
              <Field data-invalid={Boolean(errors.displayName)}>
                <FieldLabel htmlFor="complete-name">Tu nombre y apellidos</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="complete-name"
                    placeholder="Ej. Carmen López"
                    autoComplete="name"
                    className="pl-9"
                    aria-invalid={Boolean(errors.displayName)}
                    {...register('displayName')}
                  />
                </div>
                {errors.displayName ? (
                  <FieldError>{errors.displayName.message}</FieldError>
                ) : (
                  <FieldDescription>
                    Es el nombre con el que aparecerás al devolver el objeto.
                  </FieldDescription>
                )}
              </Field>

              {/* Contraseña */}
              <Field data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="complete-password">Crea una contraseña</FieldLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="complete-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Al menos 8 caracteres"
                    autoComplete="new-password"
                    className="pl-9 pr-10"
                    aria-invalid={Boolean(errors.password)}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <FieldError>{errors.password.message}</FieldError>
                ) : (
                  <FieldDescription>
                    Mínimo 8 caracteres. Recomendamos usar una frase fácil de recordar.
                  </FieldDescription>
                )}
              </Field>

              {/* Aceptación de términos */}
              <div className="pt-2">
                <Controller
                  name="acceptTerms"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="complete-terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="complete-terms"
                        className="text-xs text-muted-foreground leading-normal cursor-pointer select-none"
                      >
                        Acepto los términos del servicio y confirmo que he leído la política de
                        privacidad para la custodia de objetos encontrados.
                      </label>
                    </div>
                  )}
                />
                {errors.acceptTerms ? (
                  <p className="text-xs text-destructive pt-1.5 font-medium">
                    {errors.acceptTerms.message}
                  </p>
                ) : null}
              </div>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 border-t">
          <Button
            type="submit"
            form="complete-account-form"
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Completando cuenta...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Completar mi cuenta
              </>
            )}
          </Button>

          <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
            <Link to={returnUrl}>Volver sin completar ahora</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
