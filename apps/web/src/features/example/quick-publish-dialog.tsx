import { CATEGORIES, CATEGORY_IDS, placeholderPhoto } from '@finder/shared'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ServiceError } from '@/services'
import { useCreateItem } from './use-example-items'

// 1. Las reglas del formulario, con los mensajes que verá la persona.
const formSchema = z.object({
  title: z.string().trim().min(3, 'Escribe un título de al menos 3 letras.'),
  category: z.enum(CATEGORY_IDS, 'Elige una categoría.'),
  city: z.string().trim().min(1, 'La ciudad es obligatoria.'),
  description: z.string().trim().min(10, 'Describe el objeto con un poco más de detalle.'),
  hiddenDetails: z.string().trim().min(10, 'Añade algún detalle que solo conozca el dueño.'),
})

type FormValues = z.infer<typeof formSchema>

export function QuickPublishDialog() {
  const [open, setOpen] = useState(false)
  const createItem = useCreateItem()

  // 2. El formulario, conectado a esas reglas.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', category: undefined, city: '', description: '', hiddenDetails: '' },
  })

  // 3. Qué pasa al enviar (solo se llama si todo es válido).
  function onSubmit(values: FormValues) {
    createItem.mutate(
      {
        ...values,
        type: 'found',
        photos: [placeholderPhoto(values.title)],
        locationText: values.city,
        date: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Objeto publicado')
          form.reset()
          setOpen(false)
        },
        onError: (error) => {
          toast.error(error instanceof ServiceError ? error.message : 'No se ha podido publicar.')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          Publicación rápida
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publicar un objeto encontrado</DialogTitle>
          <DialogDescription>Versión corta del formulario, como ejemplo.</DialogDescription>
        </DialogHeader>

        <form id="quick-publish" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="qp-title">Título</FieldLabel>
                  <Input {...field} id="qp-title" aria-invalid={fieldState.invalid} placeholder="Cartera marrón de piel" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="qp-category">Categoría</FieldLabel>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger id="qp-category" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Elige una" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="qp-city">Ciudad</FieldLabel>
                    <Input {...field} id="qp-city" aria-invalid={fieldState.invalid} placeholder="Madrid" />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="qp-description">Descripción pública</FieldLabel>
                  <Textarea {...field} id="qp-description" aria-invalid={fieldState.invalid} />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="hiddenDetails"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="qp-hidden">Detalles ocultos</FieldLabel>
                  <Textarea {...field} id="qp-hidden" aria-invalid={fieldState.invalid} />
                  <FieldDescription>
                    Solo los verás tú. Sirven para comprobar quién es el dueño de verdad.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="quick-publish" disabled={createItem.isPending}>
            {createItem.isPending ? 'Publicando…' : 'Publicar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
