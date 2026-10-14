import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Navigation } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export interface StepLocationDateData {
  city: string
  address: string
  reference?: string
  foundDate: string
  // Campos de compatibilidad:
  zone: string
  referencePoint: string
  locationText: string
  date: string
}

interface StepLocationDateProps {
  initialData?: Partial<StepLocationDateData>
  onBack: (currentValues?: Partial<StepLocationDateData>) => void
  onContinue: (data: StepLocationDateData) => void
}

const getTodayDateString = () => new Date().toISOString().split('T')[0]

const formSchema = z.object({
  city: z
    .string()
    .trim()
    .min(3, 'Indica una ciudad o municipio válido de al menos 3 caracteres'),
  address: z
    .string()
    .trim()
    .min(3, 'Indica una zona o calle de al menos 3 caracteres'),
  reference: z
    .string()
    .trim()
    .refine((val) => val.length === 0 || val.length >= 3, {
      message: 'Si indicas una referencia, debe tener al menos 3 caracteres',
    }),
  foundDate: z
    .string()
    .min(1, 'Selecciona la fecha del hallazgo.')
    .refine((val) => val <= getTodayDateString(), {
      message: 'La fecha no puede ser posterior al día de hoy.',
    }),
})

type FormValues = z.infer<typeof formSchema>

export function StepLocationDate({ initialData, onBack, onContinue }: StepLocationDateProps) {
  const today = getTodayDateString()
  const [isLocating, setIsLocating] = useState(false)
  const [locationDetected, setLocationDetected] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: initialData?.city ?? '',
      address:
        initialData?.address ??
        initialData?.zone ??
        initialData?.locationText ??
        '',
      reference:
        initialData?.reference ??
        initialData?.referencePoint ??
        '',
      foundDate: initialData?.foundDate ?? initialData?.date ?? today,
    },
  })

  function handleDetectLocation() {
    setIsLocating(true)
    setLocationDetected(false)

    setTimeout(() => {
      form.setValue('city', 'Madrid', { shouldValidate: true, shouldDirty: true })
      form.setValue(
        'address',
        'Paseo de Recoletos (cerca de Biblioteca Nacional)',
        { shouldValidate: true, shouldDirty: true }
      )
      setIsLocating(false)
      setLocationDetected(true)
    }, 1000)
  }

  function onSubmit(values: FormValues) {
    const addressTrimmed = values.address.trim()
    const refTrimmed = values.reference.trim()
    const fullLocationText = refTrimmed ? `${addressTrimmed} (${refTrimmed})` : addressTrimmed

    onContinue({
      city: values.city.trim(),
      address: addressTrimmed,
      reference: refTrimmed,
      foundDate: values.foundDate,
      zone: addressTrimmed,
      referencePoint: refTrimmed,
      locationText: fullLocationText,
      date: values.foundDate,
    })
  }

  function handleBack() {
    const values = form.getValues()
    const addressTrimmed = values.address?.trim() ?? ''
    const refTrimmed = values.reference?.trim() ?? ''
    const fullLocationText = refTrimmed ? `${addressTrimmed} (${refTrimmed})` : addressTrimmed

    onBack({
      city: values.city ?? '',
      address: addressTrimmed,
      reference: refTrimmed,
      foundDate: values.foundDate ?? today,
      zone: addressTrimmed,
      referencePoint: refTrimmed,
      locationText: fullLocationText,
      date: values.foundDate ?? today,
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <CardTitle>Ubicación y momento del hallazgo</CardTitle>
        </div>
        <CardDescription>
          Indica dónde y cuándo encontraste el objeto para que el sistema pueda contrastarlo con las pérdidas notificadas.
        </CardDescription>
      </CardHeader>

      <form id="step-location-date-form" onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <FieldGroup>
            {/* Campo 1: Ciudad o municipio */}
            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="city">Ciudad o municipio</FieldLabel>
                  <Input
                    {...field}
                    id="city"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ej. Madrid, Valencia..."
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Campo 2: Zona, calle o parque */}
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <FieldLabel htmlFor="address">Zona, calle o parque</FieldLabel>
                    <div className="flex items-center gap-2">
                      {locationDetected && !isLocating ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 border-primary/20 bg-primary/10 text-primary text-xs"
                        >
                          <Check className="size-3" />
                          Ubicación detectada
                        </Badge>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="h-8 gap-1.5 text-xs"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                            <span>Obteniendo ubicación...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="size-3.5 text-primary" />
                            <span>Usar mi ubicación actual</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Input
                    {...field}
                    id="address"
                    aria-invalid={fieldState.invalid}
                    placeholder="Ej. Paseo de Recoletos, Parque del Retiro..."
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Campo 3: Punto de referencia o detalle exacto */}
            <Controller
              name="reference"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="reference">
                    Punto de referencia o detalle exacto
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="reference"
                    rows={2}
                    aria-invalid={fieldState.invalid}
                    placeholder="Ej. Encima de un banco de madera, junto a la fuente central"
                  />
                  <FieldDescription>
                    Añade pistas visuales del entorno para facilitar que el dueño lo reconozca.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Campo 4: Fecha del hallazgo */}
            <Controller
              name="foundDate"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="found-date">Fecha del hallazgo</FieldLabel>
                  <Input
                    {...field}
                    id="found-date"
                    type="date"
                    max={today}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
            Continuar a Seguridad
            <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
