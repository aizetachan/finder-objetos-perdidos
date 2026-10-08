import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Handshake,
  Mail,
  Package,
  Plus,
  RotateCcw,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Alert, AlertAction, AlertTitle } from '@/components/ui/alert'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ItemCard } from '@/features/search/item-card'
import { formatDate } from '@/lib/format'
import { paths } from '@/routes/paths'
import { useClaimsOnMyItems, useResolveClaim } from './use-claims-on-my-items'
import { useMyItems } from './use-my-items'

export function MyItemsPage() {
  const [activeTab, setActiveTab] = useState<'items' | 'received-claims'>('items')
  const { data: items, isLoading: loadingItems, isError: errorItems, refetch: refetchItems } = useMyItems()
  const {
    data: receivedClaims,
    isLoading: loadingClaims,
    isError: errorClaims,
    refetch: refetchClaims,
  } = useClaimsOnMyItems()
  const resolveClaimMutation = useResolveClaim()

  const pendingClaimsCount = receivedClaims?.filter((c) => c.status === 'pending').length || 0

  const handleResolve = async (claimId: string, status: 'accepted' | 'rejected') => {
    try {
      await resolveClaimMutation.mutateAsync({ claimId, status })
      if (status === 'accepted') {
        toast.success('¡Reclamación aceptada!', {
          description: 'Se ha marcado el objeto como entregado y confirmado el contacto.',
        })
      } else {
        toast.info('Reclamación rechazada')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar la solicitud')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6">
      {/* Cabecera principal */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to={paths.profile}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a mi perfil
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Gestión de publicaciones
          </h1>
          <p className="mt-1 text-muted-foreground">
            Administra tus objetos publicados y responde a las solicitudes de reclamación recibidas.
          </p>
        </div>

        <Button asChild className="gap-2 shadow-sm">
          <Link to={paths.publish}>
            <Plus className="h-4 w-4" />
            Publicar objeto
          </Link>
        </Button>
      </div>

      {/* Pestañas / Conmutador entre mis objetos y reclamaciones recibidas */}
      <div className="flex rounded-xl border bg-muted p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`flex-1 rounded-lg py-2.5 transition-all ${
            activeTab === 'items'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Mis Objetos Publicados ({items?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('received-claims')}
          className={`relative flex-1 rounded-lg py-2.5 transition-all ${
            activeTab === 'received-claims'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Reclamaciones Recibidas ({receivedClaims?.length || 0})
          {pendingClaimsCount > 0 && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {pendingClaimsCount} nuevas
            </span>
          )}
        </button>
      </div>

      {/* PESTAÑA 1: Mis Objetos Publicados */}
      {activeTab === 'items' && (
        <>
          {loadingItems && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex flex-col space-y-3 rounded-xl border bg-card p-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ))}
            </div>
          )}

          {errorItems && (
            <Alert variant="destructive">
              <AlertTitle className="text-base font-semibold">Error al cargar mis publicaciones</AlertTitle>
              <AlertAction>
                <Button variant="outline" size="sm" onClick={() => refetchItems()} className="mt-3 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reintentar
                </Button>
              </AlertAction>
            </Alert>
          )}

          {!loadingItems && !errorItems && (!items || items.length === 0) && (
            <Empty className="my-12 py-12">
              <EmptyMedia>
                <Package className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No has publicado ningún objeto</EmptyTitle>
                <EmptyDescription>
                  ¿Has encontrado algo en la calle o has perdido algún objeto personal? ¡Publicalo ahora!
                </EmptyDescription>
              </EmptyHeader>
              <Button asChild className="mt-4 gap-2">
                <Link to={paths.publish}>
                  <Plus className="h-4 w-4" />
                  Publicar un objeto
                </Link>
              </Button>
            </Empty>
          )}

          {!loadingItems && !errorItems && items && items.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {/* PESTAÑA 2: Reclamaciones Recibidas (Alguien reclama un objeto que yo publiqué) */}
      {activeTab === 'received-claims' && (
        <>
          {loadingClaims && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton key={idx} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          )}

          {errorClaims && (
            <Alert variant="destructive">
              <AlertTitle className="text-base font-semibold">Error al cargar solicitudes recibidas</AlertTitle>
              <AlertAction>
                <Button variant="outline" size="sm" onClick={() => refetchClaims()} className="mt-3 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reintentar
                </Button>
              </AlertAction>
            </Alert>
          )}

          {!loadingClaims && !errorClaims && (!receivedClaims || receivedClaims.length === 0) && (
            <Empty className="my-12 py-12">
              <EmptyMedia>
                <Handshake className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No has recibido ninguna reclamación</EmptyTitle>
                <EmptyDescription>
                  Cuando alguien reclame un objeto que has publicado describiendo el detalle oculto, aparecerá aquí para que la revises.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {!loadingClaims && !errorClaims && receivedClaims && receivedClaims.length > 0 && (
            <div className="space-y-4">
              {receivedClaims.map((claim) => (
                <Card key={claim.id} className="transition-all hover:border-primary/40">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg font-bold">
                          Solicitud sobre: {claim.itemTitle}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Enviada el {formatDate(claim.createdAt)} por{' '}
                          <span className="font-semibold text-foreground">{claim.claimantContact.name}</span>
                        </CardDescription>
                      </div>

                      {claim.status === 'pending' && (
                        <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          Pendiente de tu revisión
                        </Badge>
                      )}
                      {claim.status === 'accepted' && (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          Aceptada por ti
                        </Badge>
                      )}
                      {claim.status === 'rejected' && (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Rechazada
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-5 pt-0">
                    {/* Prueba o detalle que la persona aporta */}
                    <div className="rounded-xl border bg-muted/40 p-4 space-y-1">
                      <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                        <UserCheck className="h-4 w-4" />
                        Detalle / Prueba aportada por el usuario:
                      </span>
                      <p className="text-sm italic text-foreground font-medium">"{claim.proof}"</p>
                    </div>

                    {/* Contacto del usuario reclamante */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      Email de contacto del interesado: <span className="font-semibold text-foreground">{claim.claimantContact.email}</span>
                    </div>

                    {/* Acciones de resolución si está pendiente */}
                    {claim.status === 'pending' && (
                      <div className="flex flex-wrap items-center justify-end gap-3 border-t pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={resolveClaimMutation.isPending}
                          onClick={() => handleResolve(claim.id, 'rejected')}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="mr-1.5 h-4 w-4" />
                          Rechazar reclamación
                        </Button>
                        <Button
                          size="sm"
                          disabled={resolveClaimMutation.isPending}
                          onClick={() => handleResolve(claim.id, 'accepted')}
                          className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                        >
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                          Aceptar y confirmar propiedad
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

