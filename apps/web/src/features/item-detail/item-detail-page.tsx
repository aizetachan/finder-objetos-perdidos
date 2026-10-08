import { getCategoryLabel } from '@finder/shared'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Handshake,
  Lock,
  MapPin,
  PackageSearch,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { paths } from '@/routes/paths'
import { useItemDetail } from './use-item-detail'

export function ItemDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: item, isLoading, isError, error, refetch } = useItemDetail(id)

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6">
      {/* Botón de volver */}
      <div>
        <Link
          to={paths.items}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al feed de objetos
        </Link>
      </div>

      {/* ESTADO 1: Cargando */}
      {isLoading && (
        <div className="grid gap-8 md:grid-cols-12">
          <div className="space-y-4 md:col-span-6 lg:col-span-7">
            <Skeleton className="aspect-4/3 w-full rounded-2xl" />
          </div>
          <div className="space-y-4 md:col-span-6 lg:col-span-5">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-4 w-1/2" />
            <Separator />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      )}

      {/* ESTADO 2: Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle className="text-base font-semibold">Error al obtener el objeto</AlertTitle>
          <AlertDescription className="mt-1">
            {error instanceof Error
              ? error.message
              : 'Ocurrió un fallo de conexión al intentar cargar los detalles.'}
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
            <EmptyDescription>
              El objeto que buscas no existe o ha sido retirado del sistema.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline" className="mt-4 gap-2">
            <Link to={paths.items}>
              <ArrowLeft className="h-4 w-4" />
              Ver todos los objetos
            </Link>
          </Button>
        </Empty>
      )}

      {/* ESTADO 4: Con Datos */}
      {!isLoading && !isError && item && (
        <div className="grid gap-8 md:grid-cols-12">
          {/* Columna Izquierda: Galería de Foto del Producto */}
          <div className="space-y-4 md:col-span-6 lg:col-span-7">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border bg-muted shadow-sm">
              <img
                src={item.photos[0]}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge
                  variant={item.type === 'found' ? 'default' : 'secondary'}
                  className="px-3 py-1 text-xs font-semibold shadow-xs"
                >
                  {item.type === 'found' ? 'Objeto Encontrado' : 'Objeto Perdido'}
                </Badge>
                <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                  {getCategoryLabel(item.category)}
                </Badge>
              </div>

              {item.status === 'returned' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
                  <Badge className="bg-emerald-600 px-4 py-2 text-sm text-white shadow-lg">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Devuelto con éxito a su dueño
                  </Badge>
                </div>
              )}
            </div>

            {/* Tarjeta de Seguridad y Detalles Ocultos */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Sistema de Verificación por Detalle Oculto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Para proteger este objeto de reclamaciones falsas, la persona que lo encontró ha
                  registrado una característica o detalle privado (un grabado, contenido interno o marca secreta).
                </p>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Al pulsar en "¡Es mío!", deberás describir ese detalle para verificar tu identidad.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Título, Historia y Reclamación */}
          <div className="flex flex-col justify-between space-y-6 md:col-span-6 lg:col-span-5">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {item.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{item.locationText} ({item.city})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Encontrado el {formatDate(item.date)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Publicado por */}
              <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {item.createdByName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-muted-foreground">Publicado por</p>
                  <p className="text-sm font-semibold text-foreground">{item.createdByName}</p>
                </div>
              </div>

              {/* Historia y Descripción Narrativa */}
              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Historia del hallazgo
                </h2>
                <div className="rounded-xl border bg-card p-4 text-sm leading-relaxed text-muted-foreground">
                  <p className="italic text-foreground">"{item.description}"</p>
                </div>
              </div>
            </div>

            {/* Acción de Reclamar */}
            <div className="space-y-3 pt-4 border-t">
              {item.status === 'published' ? (
                <Button asChild size="lg" className="w-full font-semibold shadow-md">
                  <Link to={paths.itemClaim(item.id)}>
                    <Handshake className="mr-2 h-5 w-5" />
                    ¡Es mío! Reclamar objeto
                  </Link>
                </Button>
              ) : (
                <Button disabled size="lg" variant="secondary" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Este objeto ya ha sido reclamado
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Proceso 100% seguro y gratuito entre particulares.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
