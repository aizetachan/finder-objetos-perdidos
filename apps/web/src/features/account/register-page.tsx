import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, RotateCw } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { DemoHint } from '@/components/demo-hint'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { paths } from '@/routes/paths'
import { ServiceError, services } from '@/services'
import { passwordSchema } from './password-schema'

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(50, 'El nombre no puede tener más de 50 caracteres.'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es obligatorio.')
    .email('Introduce un email válido.'),
  password: passwordSchema,
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y la política de privacidad para continuar.',
  }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)
    try {
      await services.signUp({
        displayName: values.name,
        email: values.email,
        password: values.password,
      })
      navigate(paths.verifyEmailPending, { state: { email: values.email } })
    } catch (err) {
      if (err instanceof ServiceError) {
        // Seguridad (anti-enumeración de cuentas): si el email ya existe, navegamos
        // igualmente a la pantalla de verificación sin alertar si existía o no.
        if (err.code === 'already-exists') {
          navigate(paths.verifyEmailPending, { state: { email: values.email } })
          return
        }
        if (err.code === 'network') {
          setServerError(err.message)
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
      await services.signInWithGoogle()
      toast.success('¡Bienvenido a Finder!', {
        description: 'Has iniciado sesión con Google correctamente.',
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

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-md items-center justify-center px-4 py-8">
      <div className="w-full space-y-6">
        <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Crear cuenta en Finder</CardTitle>
          <CardDescription>
            Únete a la comunidad para publicar o reclamar objetos perdidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {serverError && (
            <Alert variant="destructive">
              <AlertTitle>Ha ocurrido un problema</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
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

          {/* Formulario de registro */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
              <Input
                id="name"
                placeholder="Lucía Martín"
                autoComplete="name"
                disabled={isSubmitting || isGoogleLoading}
                {...register('name')}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="lucia@ejemplo.com"
                autoComplete="email"
                disabled={isSubmitting || isGoogleLoading}
                {...register('email')}
              />
              <FieldError>{errors.email?.message}</FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
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

            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.acceptTerms)}>
                  <div className="flex items-start gap-2 pt-1">
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                      disabled={isSubmitting || isGoogleLoading}
                    />
                    <label
                      htmlFor="acceptTerms"
                      className="cursor-pointer text-xs leading-snug text-muted-foreground select-none"
                    >
                      Acepto la política de privacidad y los términos de uso
                    </label>
                  </div>
                  <FieldError>{errors.acceptTerms?.message}</FieldError>
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isGoogleLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                'Crear cuenta'
              )}
            </Button>
          </form>

          {/* Enlace inferior */}
          <div className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link
              to={paths.login}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>

      <DemoHint className="pt-2" />
    </div>
  </div>
)
}
