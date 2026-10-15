import { zodResolver } from '@hookform/resolvers/zod'
import {
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
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { getCategoryLabel } from '@finder/shared'
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
import { paths } from '@/routes/paths'
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
  onReset: () => void
}

export function StepReviewConfirm({
  step1Data,
  step2Data,
  step3Data,
  initialEmail = '',
  onBack,
  onReset,
}: StepReviewConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialEmail,
    },
  })

  function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setSubmittedEmail(values.email)

    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1000)
  }

  async function handleCopyLink() {
    const trackingUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/seguimiento/FND-8492`
        : 'https://finder.app/seguimiento/FND-8492'

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(trackingUrl)
      }
    } catch {
      // Si el portapapeles no está disponible en el entorno
    }

    setIsCopied(true)
    toast.success('¡Enlace de seguimiento copiado al portapapeles!')
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  function handleOpenTracking() {
    toast.info('Simulación: Abriendo panel de gestión y seguimiento (#FND-8492)')
  }

  function handleResendEmail() {
    toast.success(`Correo de activación reenviado a ${submittedEmail || 'tu correo'}`)
  }

  const deliveryInfo = step3Data?.deliveryMethod
    ? DELIVERY_METHOD_DETAILS[step3Data.deliveryMethod] ?? {
        emoji: '📍',
        label: step3Data.deliveryMethod,
      }
    : { emoji: '📍', label: 'No seleccionado' }

  const isGmail =
    submittedEmail.toLowerCase().trim().endsWith('@gmail.com') ||
    submittedEmail.toLowerCase().trim().endsWith('@googlemail.com')

  // Pantalla de Éxito / Feedback final
  if (isSuccess) {
    // 1. Estado Pendiente de Confirmación (pending_verification):
    // Limpio y sin saturación, con foco exclusivo en la activación por correo
    if (!isEmailVerified) {
      return (
        <Card className="w-full text-center py-6 sm:py-8 border bg-card">
          <CardContent className="space-y-6 flex flex-col items-center">
            {/* Icono de correo pendiente */}
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-8" />
            </div>

            {/* Encabezado y explicación contextual con enlace directo a Gmail si aplica */}
            <div className="space-y-2 max-w-md mx-auto">
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                ¡Casi listo! Confirma tu correo
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-normal">
                Hemos enviado un enlace de activación a{' '}
                <strong className="text-foreground font-semibold">
                  {submittedEmail || 'tu correo'}
                </strong>.
                {isGmail ? (
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-1 font-medium ml-1.5"
                  >
                    Abrir Gmail <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </p>
            </div>

            {/* Mini stepper horizontal sutil (3 pasos discretos) */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 text-xs py-1">
              {/* Paso 1: Datos enviados (Check verde) */}
              <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                  <Check className="size-3 stroke-[2.5]" />
                </div>
                <span>1. Datos enviados</span>
              </div>

              {/* Conector 1 -> 2 */}
              <div className="h-0.5 w-4 sm:w-8 rounded-full bg-emerald-500/40" />

              {/* Paso 2: Confirmar email (Reloj amarillo activo) */}
              <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                <div className="flex size-5 items-center justify-center rounded-full bg-amber-500/15 animate-pulse">
                  <Clock className="size-3" />
                </div>
                <span>2. Confirmar email</span>
              </div>

              {/* Conector 2 -> 3 */}
              <div className="h-0.5 w-4 sm:w-8 rounded-full bg-muted-foreground/20" />

              {/* Paso 3: Activo en catálogo (Candado en espera) */}
              <div className="flex items-center gap-1.5 font-medium text-muted-foreground/60">
                <div className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
                  <Lock className="size-2.5" />
                </div>
                <span>3. Activo en catálogo</span>
              </div>
            </div>

            {/* Acción terciaria discreta: reenviar correo */}
            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendEmail}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ¿No lo has recibido? Reenviar correo
              </Button>
            </div>

            {/* Control de presentación (Demo): simular verificación */}
            <div className="w-full max-w-sm border-t border-dashed border-border/80 pt-4 mt-2 flex flex-col items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEmailVerified(true)
                  toast.success('¡Email verificado! Tu publicación ya está activa en el catálogo.')
                }}
                className="border-dashed text-xs text-muted-foreground hover:text-foreground"
              >
                [Demo] Simular verificación de email
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    // 2. Estado Activo / Verificado (active_published):
    // Revela la tarjeta oficial de seguimiento y los botones de navegación
    return (
      <Card className="w-full text-center py-6 sm:py-8 border bg-card">
        <CardContent className="space-y-6 flex flex-col items-center">
          {/* Icono de publicación exitosa */}
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-10" />
          </div>

          {/* Encabezado confirmado */}
          <div className="space-y-2 max-w-md mx-auto">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              ¡Objeto publicado con éxito!
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Tu correo ha sido verificado y el objeto ya está activo y visible en el catálogo de
              hallazgos.
            </CardDescription>
          </div>

          {/* Mini stepper: los 3 pasos completados en verde */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 text-xs py-1">
            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span>1. Datos enviados</span>
            </div>

            <div className="h-0.5 w-4 sm:w-8 rounded-full bg-emerald-500/40" />

            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span>2. Email confirmado</span>
            </div>

            <div className="h-0.5 w-4 sm:w-8 rounded-full bg-emerald-500/40" />

            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/15">
                <Check className="size-3 stroke-[2.5]" />
              </div>
              <span>3. Activo en catálogo</span>
            </div>
          </div>

          {/* Tarjeta oficial de seguimiento */}
          <div className="rounded-lg border bg-muted/30 p-5 max-w-md w-full space-y-3.5 text-center">
            {/* Insignia verde oficial */}
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="border-border bg-background px-3 py-1 text-xs font-normal"
              >
                🟢 Publicado y visible (Buscando dueño)
              </Badge>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Código de seguimiento
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenTracking}
                  className="group inline-flex items-center gap-1.5 font-mono text-2xl font-bold text-primary hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-0.5 transition-all"
                  title="Abrir panel de seguimiento del objeto"
                >
                  <span>#FND-8492</span>
                  <ExternalLink className="size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  title={isCopied ? '¡Enlace copiado!' : 'Copiar enlace de seguimiento'}
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label="Copiar enlace de seguimiento"
                >
                  {isCopied ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Microcopy bajo el código */}
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              Hemos enviado este mismo enlace directo a tu correo. Úsalo para comprobar el estado o
              editar la publicación en cualquier momento.
            </p>

            {submittedEmail ? (
              <p className="text-[11px] text-muted-foreground/80 border-t border-border/50 pt-2.5">
                Avisos configurados para:{' '}
                <span className="font-medium text-foreground">{submittedEmail}</span>
              </p>
            ) : null}
          </div>

          {/* Botones de salida jerarquizados */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm pt-2">
            <Button asChild className="w-full sm:w-auto flex-1 gap-2">
              <Link to={paths.home}>Ver en el catálogo de objetos</Link>
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

          {/* Control de presentación (Demo): volver a pendiente si se desea */}
          <div className="w-full max-w-sm border-t border-dashed border-border/80 pt-4 mt-1 flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEmailVerified(false)
                toast.info('Simulación: Estado restablecido a pendiente de confirmación.')
              }}
              className="border-dashed text-xs text-muted-foreground hover:text-foreground"
            >
              [Demo] Restablecer a estado pendiente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
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
          {/* 2. Tarjeta resumen del objeto (Vista previa pública vs. privada) */}
          <div className="rounded-lg border bg-muted/20 p-4 sm:p-5 space-y-5">
            {/* Cabecera de la ficha: miniatura, título y Badge categoría */}
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

            <Separator />

            {/* Bloque de Ubicación y Fecha */}
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

            {/* Bloque de Entrega */}
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

            {/* Bloque de Seguridad (Detalle confidencial) */}
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

          {/* 3. Bloque de Contacto (Lazy Registration) */}
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
                No necesitas contraseña ahora. Solo utilizaremos este correo para notificarte cuando
                alguien verifique el detalle oculto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field data-invalid={Boolean(errors.email)}>
                  <FieldLabel htmlFor="contact-email">Correo electrónico de contacto</FieldLabel>
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
                      Te enviaremos un enlace seguro para gestionar la entrega cuando se verifique
                      un reclamo.
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
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

          <Button type="submit" disabled={isSubmitting} className="gap-2">
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
        </CardFooter>
      </Card>
    </form>
  )
}
