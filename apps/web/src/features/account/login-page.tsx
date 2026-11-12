import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, RotateCw } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { DemoHint } from '@/components/demo-hint'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { paths } from '@/routes/paths'
import { ServiceError, services } from '@/services'

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio.')
    .email('Introduce un email válido.'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      const user = await services.signIn(values.email, values.password)

      if (!user.emailVerified) {
        toast.info('Tu email aún no está verificado.', {
          description: 'Revisa tu bandeja para poder publicar y reclamar.',
        })
        navigate(paths.verifyEmailPending, { state: { email: user.email } })
      } else {
        toast.success('¡Hola de nuevo!', {
          description: `Has iniciado sesión como ${user.displayName}.`,
        })
        const from = (location.state as { from?: string } | null)?.from ?? paths.home
        navigate(from)
      }
    } catch (err) {
      if (err instanceof ServiceError) {
        if (err.code === 'network') {
          setServerError(err.message)
          return
        }
        if (err.code === 'too-many-requests') {
          setServerError(err.message)
          return
        }
        if (err.code === 'invalid') {
          setServerError('El email o la contraseña no son correctos.')
          return
        }
      }
      setServerError('No hemos podido conectar con el servidor. Comprueba tu conexión a internet.')
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setServerError(null)
    try {
      const user = await services.signInWithGoogle()
      toast.success('¡Hola de nuevo!', {
        description: `Has iniciado sesión como ${user.displayName}.`,
      })
      const from = (location.state as { from?: string } | null)?.from ?? paths.home
      navigate(from)
    } catch (err) {
      if (err instanceof ServiceError && err.code === 'popup-closed') {
        return
      }
      if (err instanceof ServiceError && err.code === 'network') {
        setServerError(err.message)
        return
      }
      setServerError('No se pudo conectar con el servicio de autenticación de Google.')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    toast.info('Muy pronto', {
      description: 'La recuperación de contraseñas estará disponible próximamente.',
    })
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-8">
      <div className="w-full space-y-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Iniciar sesión</CardTitle>
            <CardDescription>
              Introduce tus datos para acceder a tu cuenta de Finder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertTitle>No se pudo iniciar sesión</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
                {serverError.includes('conexión') && (
                  <AlertAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServerError(null)}
                      className="gap-1.5"
                    >
                      <RotateCw className="size-3.5" />
                      Reintentar
                    </Button>
                  </AlertAction>
                )}
              </Alert>
            )}

            {/* Botón de Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
            >
              {isGoogleLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Continuar con Google
            </Button>

            {/* Separador con "o" */}
            <div className="relative flex items-center justify-center">
              <Separator className="w-full" />
              <span className="absolute bg-card px-2 text-xs uppercase text-muted-foreground">
                o
              </span>
            </div>

            {/* Formulario de Login */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                  disabled={isSubmitting || isGoogleLoading}
                  {...register('email')}
                />
                <FieldError>{errors.email?.message}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.password)}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <a
                    href="#recuperar"
                    onClick={handleForgotPassword}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    ¿Has olvidado tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Introduce tu contraseña"
                    autoComplete="current-password"
                    disabled={isSubmitting || isGoogleLoading}
                    className="pr-10"
                    {...register('password')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
                <FieldError>{errors.password?.message}</FieldError>
              </Field>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isGoogleLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            {/* Enlace inferior a registro */}
            <div className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link
                to={paths.register}
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                Crear cuenta
              </Link>
            </div>
          </CardContent>
        </Card>

        <DemoHint className="pt-2" />
      </div>
    </div>
  )
}
