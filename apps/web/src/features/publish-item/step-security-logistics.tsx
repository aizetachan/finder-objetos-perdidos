import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const DELIVERY_OPTIONS = [
  {
    id: 'suggested-point' as const,
    emoji: '☕',
    title: 'Punto sugerido: Cafetería Central (A 5 min)',
    description: 'Punto de encuentro público, seguro y concurrido.',
    isFeatured: true,
  },
  {
    id: 'partner-store' as const,
    emoji: '📦',
    title: 'Dejar en comercio asociado',
    description: 'Punto colaborador cercano.',
    isFeatured: false,
  },
  {
    id: 'shipping' as const,
    emoji: '🚚',
    title: 'Enviar por correo (Paga el dueño)',
    description: 'Coste asumido íntegramente por el propietario.',
    isFeatured: false,
  },
  {
    id: 'chat' as const,
    emoji: '💬',
    title: 'Acordar manualmente por chat',
    description:
      'El chat interno se abrirá con tu alias protegido, sin mostrar tu número ni datos reales.',
    isFeatured: false,
  },
] as const

export type DeliveryMethod = (typeof DELIVERY_OPTIONS)[number]['id']

export interface StepSecurityLogisticsData {
  hiddenDetails: string
  deliveryMethod: DeliveryMethod
}

interface StepSecurityLogisticsProps {
  initialData?: Partial<StepSecurityLogisticsData>
  onBack: (currentValues?: Partial<StepSecurityLogisticsData>) => void
  onContinue: (data: StepSecurityLogisticsData) => void
}

const formSchema = z.object({
  hiddenDetails: z
    .string()
    .trim()
    .min(10, 'Describe un detalle de al menos 10 caracteres para garantizar una validación segura'),
  deliveryMethod: z.enum(['suggested-point', 'partner-store', 'shipping', 'chat']),
})

type FormValues = z.infer<typeof formSchema>

export function StepSecurityLogistics({
  initialData,
  onBack,
  onContinue,
}: StepSecurityLogisticsProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hiddenDetails: initialData?.hiddenDetails ?? '',
      deliveryMethod: initialData?.deliveryMethod ?? 'suggested-point',
    },
  })

  function onSubmit(values: FormValues) {
    onContinue({
      hiddenDetails: values.hiddenDetails.trim(),
      deliveryMethod: values.deliveryMethod,
    })
  }

  function handleBack() {
    onBack(form.getValues())
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <CardTitle>Seguridad y método de entrega</CardTitle>
        </div>
        <CardDescription>
          Define la pista secreta para comprobar al dueño y tu preferencia para devolverlo.
        </CardDescription>
      </CardHeader>

      <form id="step-security-logistics-form" onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            {/* Bloque 1: Detalle confidencial (Muro anti-fraude) */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    Detalle confidencial de verificación
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Este dato nunca será público. Solo servirá para validar la identidad de quien lo reclame.
                  </p>
                </div>
              </div>

              <Controller
                name="hiddenDetails"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="hidden-details" className="text-xs font-medium">
                      ¿Qué detalle específico solo el dueño podría conocer?
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="hidden-details"
                      rows={3}
                      aria-invalid={fieldState.invalid}
                      placeholder="Ej. Tiene una pequeña raspadura en la esquina inferior izquierda, una pegatina desgastada detrás, o una funda azul con una tarjeta dentro..."
                      className="bg-background text-sm"
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {/* Bloque 2: Logística y entrega (Selector vertical de 4 opciones) */}
            <div className="space-y-3 pt-2">
              <FieldLabel className="text-sm font-medium">
                ¿Cómo prefieres gestionar la devolución?
              </FieldLabel>
              <Controller
                name="deliveryMethod"
                control={form.control}
                render={({ field }) => (
                  <div className="flex flex-col gap-2.5">
                    {DELIVERY_OPTIONS.map((option) => {
                      const isSelected = field.value === option.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => field.onChange(option.id)}
                          className={cn(
                            'group flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                              : option.isFeatured
                                ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                                : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          {/* Radio visual */}
                          <div
                            className={cn(
                              'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors mt-0.5',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-muted-foreground/40'
                            )}
                          >
                            {isSelected ? (
                              <div className="size-1.5 rounded-full bg-background" />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-base select-none">{option.emoji}</span>
                              <span
                                className={cn(
                                  'text-sm font-semibold leading-tight',
                                  isSelected ? 'text-primary' : 'text-foreground'
                                )}
                              >
                                {option.title}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>

          <Button type="submit" className="gap-2">
            Continuar a Revisar
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
