import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { getCategoryLabel, type Item, type NewItemInput } from '@finder/shared'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { ServiceError } from '@/services/types'
import type { StepLocationDateData } from './step-location-date'
import type { StepPhotoAiData } from './step-photo-ai'
import type { StepSecurityLogisticsData } from './step-security-logistics'

const DELIVERY_METHOD_DETAILS: Record<string, { emoji: string; label: string }> = {
  'suggested-point': {
    emoji: '☕',
    label: 'Cafetería Central (A 5 min)',
  },
  'partner-store': {
    emoji: '📦',
    label: 'Dejar en comercio asociado',
  },
  shipping: {
    emoji: '🚚',
    label: 'Enviar por correo (Paga el dueño)',
  },
  chat: {
    emoji: '💬',
    label: 'Acordar manualmente por chat',
  },
}

const formSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El correo electrónico de contacto es obligatorio')
    .email('Introduce una dirección de correo electrónico válida'),
})

type FormValues = z.infer<typeof formSchema>

export interface StepReviewConfirmProps {
  step1Data: StepPhotoAiData | null
  step2Data: StepLocationDateData | null
  step3Data: StepSecurityLogisticsData | null
  initialEmail?: string
  onBack: (currentEmail?: string) => void
  onGoToStep?: (step: number) => void
  onReset: () => void
}

interface StepValidationError {
  step: number
  message: string
}

function checkStepData(
  step1: StepPhotoAiData | null,
  step2: StepLocationDateData | null,
  step3: StepSecurityLogisticsData | null,
): StepValidationError | null {
  if (!step1 || !step1.title?.trim() || !step1.category) {
    return {
      step: 1,
      message: 'Falta información en el paso 1: debes indicar el título y la categoría del objeto.',
    }
  }

  const hasLocation =
    Boolean(step2?.city?.trim()) &&
    Boolean(step2?.locationText?.trim() || step2?.address?.trim())
  const rawDate = step2?.date || step2?.foundDate
  const hasValidDate = Boolean(rawDate && !isNaN(new Date(rawDate).getTime()))

  if (!step2 || !hasLocation || !hasValidDate) {
    return {
      step: 2,
      message:
        'Falta información en el paso 2: debes indicar la ciudad, la ubicación y la fecha del hallazgo.',
    }
  }

  if (!step3 || !step3.hiddenDetails?.trim()) {
    return {
      step: 3,
      message:
        'Falta información en el paso 3: el detalle protegido contra fraude es obligatorio para poder publicar.',
    }
  }

  return null
}

export function StepReviewConfirm({
  step1Data,
  step2Data,
  step3Data,
  initialEmail = '',
  onBack,
  onGoToStep,
  onReset,
}: StepReviewConfirmProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [createdItem, setCreatedItem] = useState<Item | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [pendingGuestEmail, setPendingGuestEmail] = useState(initialEmail)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [stepError, setStepError] = useState<StepValidationError | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail || (user?.email ?? ''),
    },
  })

  // Publicar directamente con el usuario actual en sesión
  async function handlePublishWithUser() {
    setSubmitError(null)
    const validationError = checkStepData(step1Data, step2Data, step3Data)
    if (validationError) {
      setStepError(validationError)
      return
    }
    setStepError(null)
    setIsSubmitting(true)

    const dateIso = new Date(step2Data!.date || step2Data!.foundDate!).toISOString()
    const payload: NewItemInput = {
      type: 'found',
      title: step1Data!.title.trim(),
      description: step1Data!.description?.trim() || '',
      category: step1Data!.category,
      photos: step1Data!.photoUrl ? [step1Data!.photoUrl] : [],
      city: step2Data!.city.trim(),
      locationText: (step2Data!.locationText || step2Data!.address || step2Data!.city).trim(),
      date: dateIso,
      hiddenDetails: step3Data!.hiddenDetails.trim(),
    }

    try {
      const item = await services.createItem(payload)
      setCreatedItem(item)
      await queryClient.invalidateQueries({ queryKey: ['items'] })
      await queryClient.invalidateQueries({ queryKey: ['myItems'] })
      toast.success('¡Objeto publicado con éxito!')
    } catch (err) {
      if (err instanceof ServiceError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('No se pudo publicar el objeto. Revisa tu conexión y vuelve a intentarlo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Usuario no autenticado: enviar enlace de confirmación
  async function onSubmitGuest(values: FormValues) {
    setSubmitError(null)
    const validationError = checkStepData(step1Data, step2Data, step3Data)
    if (validationError) {
      setStepError(validationError)
      return
    }
    setStepError(null)
    setIsSubmitting(true)
    setPendingGuestEmail(values.email)

    try {
      await services.startGuestPublish(values.email)
      setEmailSent(true)
      toast.success('Enlace de confirmación enviado')
    } catch (err) {
      if (err instanceof ServiceError) {
        setSubmitError(err.message)
      } else {
        setSubmitError('No se pudo enviar el enlace. Revisa tu conexión y vuelve a intentarlo.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reenviar el correo de confirmación manteniendo la lógica real de servicios
  async function handleResendEmail() {
    if (!pendingGuestEmail || isResending) return
    setSubmitError(null)
    setIsResending(true)

    try {
      await services.startGuestPublish(pendingGuestEmail)
      toast.success(`Correo de confirmación reenviado a ${pendingGuestEmail}`)
    } catch (err) {
      if (err instanceof ServiceError) {
        toast.error(err.message)
      } else {
        toast.error('No se pudo reenviar el correo. Revisa tu conexión y vuelve a intentarlo.')
      }
    } finally {
      setIsResending(false)
    }
  }

  async function handleCopyLink() {
    if (!createdItem) return
    const trackingUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${paths.itemDetail(createdItem.id)}`
        : paths.itemDetail(createdItem.id)

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(trackingUrl)
      }
    } catch {
      // Ignorar si el portapapeles no está disponible
    }

    setIsCopied(true)
    toast.success('¡Enlace del objeto copiado al portapapeles!')
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const deliveryInfo = step3Data?.deliveryMethod
    ? DELIVERY_METHOD_DETAILS[step3Data.deliveryMethod] ?? {
        emoji: '📍',
        label: step3Data.deliveryMethod,
      }
    : { emoji: '📍', label: 'No seleccionado' }

  const isGmail =
    pendingGuestEmail.toLowerCase().trim().endsWith('@gmail.com') ||
    pendingGuestEmail.toLowerCase().trim().endsWith('@googlemail.com')

  // Pantalla de Éxito / Feedback final
  if (createdItem) {
    return (
      <Card className="w-full text-center py-6 sm:py-8 border bg-card">
        <CardContent className="space-y-6 flex flex-col items-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              ¡Objeto publicado con éxito!
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Ya está visible en el catálogo de hallazgos. Te enviaremos un correo si alguien lo
              reclama con el detalle correcto.
            </CardDescription>
          </div>

          {/* Mini barra de progreso de 3 pasos completados (con tokens semánticos) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 text-xs py-1">
            <div className="flex items-center gap-1.5 font-medium text-primary">
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span>1. Datos enviados</span>
            </div>

            <div className="h-0.5 w-4 sm:w-8 rounded-full bg-primary/40" />

            <div className="flex items-center gap-1.5 font-medium text-primary">
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span>2. Email confirmado</span>
            </div>

            <div className="h-0.5 w-4 sm:w-8 rounded-full bg-primary/40" />

            <div className="flex items-center gap-1.5 font-medium text-primary">
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span>3. Activo en catálogo</span>
            </div>
          </div>

          {/* Bloque interactivo del código de seguimiento */}
          <div className="rounded-lg border bg-muted/30 p-5 max-w-md w-full space-y-3.5 text-center">
            {/* Insignia de estado actual */}
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="border-border bg-background px-3 py-1 text-xs font-normal"
              >
                🟢 Activo en catálogo (Buscando dueño)
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Identificador de publicación
              </p>
              <div className="flex items-center justify-center">
                <Link
                  to={paths.itemDetail(createdItem.id)}
                  className="group inline-flex items-center gap-1.5 font-mono text-2xl font-bold text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-0.5 transition-all"
                  title="Abrir ficha del objeto"
                >
                  <span>#{createdItem.id}</span>
                  <ExternalLink className="size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>

            {/* Botón interactivo de copiar */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-2 text-xs font-medium border-border w-full sm:w-auto"
              >
                {isCopied ? (
                  <>
                    <Check className="size-3.5 text-primary" />
                    ¡Enlace copiado!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-muted-foreground" />
                    Copiar enlace de publicación
                  </>
                )}
              </Button>
            </div>

            {/* Microcopy bajo el código */}
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Hemos asociado este hallazgo a tu correo:{' '}
              <span className="font-medium text-foreground">{user?.email}</span>. Úsalo para
              comprobar el estado o resolver reclamaciones en cualquier momento.
            </p>
          </div>

          {/* Acciones finales */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pt-2">
            <Button asChild className="w-full sm:w-auto flex-1 gap-2">
              <Link to={paths.itemDetail(createdItem.id)}>Ver publicación</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="w-full sm:w-auto flex-1 gap-2"
            >
              <RotateCcw className="size-4" />
              Publicar otro objeto
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 w-full">
      <Card className="w-full border bg-card">
        {/* 1. Cabecera del paso */}
        <CardHeader>
          <CardTitle>Revisa los datos antes de publicar</CardTitle>
          <CardDescription>
            Comprueba que la información sea correcta. Podrás editarla más adelante si lo
            necesitas.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {stepError ? (
            <Alert
              variant="destructive"
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-start gap-2 min-w-0">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  <AlertTitle>Falta información en el paso {stepError.step}</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    {stepError.message}
                  </AlertDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 bg-background text-foreground self-start sm:self-center"
                onClick={() => (onGoToStep ? onGoToStep(stepError.step) : onBack())}
              >
                Ir al paso {stepError.step}
              </Button>
            </Alert>
          ) : null}

          {submitError ? (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>No se pudo completar</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          ) : null}

          {/* 2. Tarjeta resumen del objeto */}
          <div className="rounded-lg border bg-muted/20 p-4 sm:p-5 space-y-5">
            <div className="flex items-start gap-4">
              <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                {step1Data?.photoUrl ? (
                  <img
                    src={step1Data.photoUrl}
                    alt={step1Data.title || 'Foto del objeto'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileText className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">
                    {step1Data?.title || 'Objeto sin título'}
                  </h3>
                  {step1Data?.category ? (
                    <Badge variant="secondary" className="font-normal text-xs">
                      {getCategoryLabel(step1Data.category)}
                    </Badge>
                  ) : null}
                </div>
                {step1Data?.description ? (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {step1Data.description}
                  </p>
                ) : null}
              </div>
            </div>

            {step1Data?.story ? (
              <>
                <Separator />
                <div className="space-y-1 text-sm">
                  <p className="text-xs font-medium text-muted-foreground">Tu historia</p>
                  <p className="italic text-foreground">"{step1Data.story}"</p>
                </div>
              </>
            ) : null}

            <Separator />

            {/* Ubicación y Fecha */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-medium text-foreground">
                  {step2Data?.city || 'Ciudad no especificada'}
                  {step2Data?.address ? ` · ${step2Data.address}` : ''}
                </p>
                {step2Data?.reference ? (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Punto de referencia:</span>{' '}
                    {step2Data.reference}
                  </p>
                ) : null}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                  <Calendar className="size-3.5" />
                  <span>
                    Hallado el {step2Data?.foundDate || step2Data?.date || 'Fecha no registrada'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Entrega */}
            <div className="flex items-start gap-3 text-sm">
              <span className="text-xl select-none leading-none mt-0.5">
                {deliveryInfo.emoji}
              </span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs text-muted-foreground font-medium">Método de entrega</p>
                <p className="font-medium text-foreground">{deliveryInfo.label}</p>
              </div>
            </div>

            <Separator />

            {/* Seguridad (Detalle confidencial) */}
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-primary" />
                  🔒 Detalle protegido contra fraude
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider font-semibold border-border"
                >
                  Confidencial
                </Badge>
              </div>
              <div className="rounded border bg-background/80 p-2.5 text-xs sm:text-sm text-foreground italic">
                "{step3Data?.hiddenDetails || 'Sin detalles adicionales indicados'}"
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Este dato no será visible para terceros en el catálogo. Se utilizará exclusivamente
                como pista secreta para comprobar la legitimidad de quien lo reclame.
              </p>
            </div>
          </div>

          {/* 3. Bloque de Contacto / Sesión */}
          {user ? (
            <Card className="border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <UserCheck className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Publicando con tu cuenta
                  </CardTitle>
                </div>
                <CardDescription className="text-xs pt-1">
                  El objeto quedará registrado a nombre de tu perfil para notificarte cualquier
                  reclamación.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3.5 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {user.isGuest ? (
                    <Badge variant="secondary" className="text-xs">
                      Cuenta temporal
                    </Badge>
                  ) : null}
                </div>
                {user.isGuest ? (
                  <p className="text-[11px] text-muted-foreground">
                    Podrás completar tu registro y establecer una contraseña más adelante si alguien
                    reclama este objeto.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : emailSent ? (
            <Card className="border bg-primary/5 border-primary/20">
              <CardHeader className="pb-3 text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    Revisa tu correo para confirmar
                  </CardTitle>
                </div>
                <CardDescription className="text-xs pt-1">
                  Hemos enviado un enlace a{' '}
                  <span className="font-semibold text-foreground">{pendingGuestEmail}</span>.
                  {isGmail ? (
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-1 font-medium ml-1.5"
                    >
                      Abrir Gmail <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {/* Mini barra de progreso de 3 pasos (usando exclusivamente tokens semánticos) */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 rounded-md border bg-background/60 px-3 py-2 text-xs">
                  {/* Paso 1: Datos enviados */}
                  <div className="flex items-center gap-1.5 font-medium text-primary">
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3 stroke-[2.5]" />
                    </div>
                    <span>1. Datos enviados</span>
                  </div>

                  {/* Conector 1 -> 2 */}
                  <div className="h-0.5 w-4 sm:w-8 rounded-full bg-primary/40" />

                  {/* Paso 2: Confirmar email (Activo) */}
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground animate-pulse">
                      <Clock className="size-3" />
                    </div>
                    <span>2. Confirmar email</span>
                  </div>

                  {/* Conector 2 -> 3 */}
                  <div className="h-0.5 w-4 sm:w-8 rounded-full bg-border" />

                  {/* Paso 3: Activo en catálogo (En espera) */}
                  <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Lock className="size-2.5" />
                    </div>
                    <span>3. Activo en catálogo</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pulsa en el enlace del correo para confirmar que la dirección es correcta. Al
                  hacerlo, tu publicación se completará automáticamente.
                </p>

                {/* Botón secundario de Reenviar correo */}
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isResending}
                    onClick={() => void handleResendEmail()}
                    className="-ml-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        Reenviando correo...
                      </>
                    ) : (
                      '¿No lo has recibido? Reenviar correo'
                    )}
                  </Button>
                </div>

                <div className="rounded-md border bg-background/80 p-3 space-y-2 text-xs">
                  <p className="font-medium text-foreground">💡 ¿Probando con datos de ejemplo?</p>
                  <p className="text-muted-foreground">
                    Abre el <strong>Simulador de casos</strong> en la cabecera o haz clic en el
                    siguiente acceso rápido:
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                    <Link to={`${paths.confirmGuestEmail}?code=demo-guest`}>
                      Simular abrir el enlace de confirmar publicación
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Mail className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    ¿Dónde te avisamos si el dueño lo reclama?
                  </CardTitle>
                </div>
                <CardDescription className="text-xs pt-1">
                  No necesitas contraseña ahora. Te enviaremos un enlace de confirmación antes de
                  publicar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form id="guest-email-form" onSubmit={handleSubmit(onSubmitGuest)}>
                  <FieldGroup>
                    <Field data-invalid={Boolean(errors.email)}>
                      <FieldLabel htmlFor="contact-email">
                        Correo electrónico de contacto
                      </FieldLabel>
                      <Input
                        id="contact-email"
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        {...register('email')}
                      />
                      {errors.email ? (
                        <FieldError>{errors.email.message}</FieldError>
                      ) : (
                        <FieldDescription>
                          Te enviaremos un enlace de un solo clic para confirmar tu publicación.
                        </FieldDescription>
                      )}
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          )}
        </CardContent>

        {/* 4. Acción principal y navegación */}
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onBack(getValues('email'))}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>

          {user ? (
            <Button
              type="button"
              onClick={() => void handlePublishWithUser()}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  Publicar objeto encontrado
                </>
              )}
            </Button>
          ) : !emailSent ? (
            <Button
              type="submit"
              form="guest-email-form"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                <>
                  <Mail className="size-4" />
                  Confirmar email para publicar
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEmailSent(false)}
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Cambiar correo
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
