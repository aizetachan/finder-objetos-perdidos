import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  Handshake,
  Lock,
  PackageSearch,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { useItemDetail } from './use-item-detail'

const claimSchema = z.object({
  proof: z
    .string()
    .min(10, 'Describe el detalle oculto con al menos 10 caracteres para demostrar que el objeto es tuyo'),
})

type ClaimFormValues = z.infer<typeof claimSchema>

export function ClaimItemPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading, isError, error, refetch } = useItemDetail(id)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: { proof: '' },
  })

  const onSubmit = async (values: ClaimFormValues) => {
    try {
      await services.createClaim({
        itemId: id,
        proof: values.proof,
      })
      toast.success('¡Reclamación enviada con éxito!', {
        description: 'La persona que encontró el objeto revisará tu detalle para confirmar tu propiedad.',
      })
      navigate(paths.myClaims)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar la reclamación')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      {/* Volver */}
      <div>
        <Link
          to={paths.itemDetail(id)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la ficha del objeto
        </Link>
      </div>

      {/* ESTADO 1: Cargando */}
      {isLoading && (
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </Card>
      )}

      {/* ESTADO 2: Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle className="text-base font-semibold">Error al cargar la información</AlertTitle>
          <AlertDescription className="mt-1">
            {error instanceof Error ? error.message : 'Fallo de conexión.'}
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3 gap-2">
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* ESTADO 3: No encontrado */}
      {!isLoading && !isError && !item && (
        <Empty className="my-12 py-12">
          <EmptyMedia>
            <PackageSearch className="h-12 w-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Objeto no encontrado</EmptyTitle>
            <EmptyDescription>El objeto que intentas reclamar no existe.</EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline" className="mt-4 gap-2">
            <Link to={paths.items}>Volver al feed</Link>
          </Button>
        </Empty>
      )}

      {/* ESTADO 4: Con datos - Formulario */}
      {!isLoading && !isError && item && (
        <div className="space-y-6">
          {/* Resumen del objeto a reclamar */}
          <Card>
            <CardHeader className="p-5 pb-3">
              <Badge variant="outline" className="w-fit mb-1">
                Reclamando propiedad
              </Badge>
              <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
              <CardDescription>
                Publicado por {item.createdByName} en {item.city} ({item.locationText})
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Formulario de Detalle Oculto */}
          <Card className="border-primary/30 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Demuestra que este objeto es tuyo
              </CardTitle>
              <CardDescription>
                Describe el <strong>detalle oculto o marca secreta</strong> que tiene el objeto (ej. un grabado interno, una pegatina trasera, o un contenido específico en el forro).
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="proof" className="text-sm font-semibold">
                    Descripción del detalle privado o prueba
                  </Label>
                  <Textarea
                    id="proof"
                    placeholder="Ejemplo: En el Bolsillo interior hay una pegatina de un gato y las iniciales 'A.M.' en la correa..."
                    rows={5}
                    {...register('proof')}
                    className={errors.proof ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.proof && (
                    <p className="text-xs font-medium text-destructive">{errors.proof.message}</p>
                  )}
                </div>

                <div className="rounded-xl border bg-muted/50 p-4 text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Lock className="h-3.5 w-3.5 text-primary" />
                    ¿Cómo funciona este proceso?
                  </div>
                  <p>
                    Tus datos de contacto serán compartidos únicamente con {item.createdByName}. Si tu respuesta coincide con el detalle oculto que él registró, aceptará la reclamación y se pondrá en contacto contigo para acordar la entrega.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button asChild variant="outline" type="button">
                    <Link to={paths.itemDetail(id)}>Cancelar</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2 font-semibold">
                    <Handshake className="h-4 w-4" />
                    {isSubmitting ? 'Enviando...' : 'Enviar reclamación'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
