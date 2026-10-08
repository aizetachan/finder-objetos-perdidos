import { ArrowLeft, CheckCircle2, Clock, Handshake, RotateCcw, Trash2, XCircle } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { paths } from '@/routes/paths'
import { useCancelClaim, useMyClaims } from './use-my-claims'

export function MyClaimsPage() {
  const { data: claims, isLoading, isError, error, refetch } = useMyClaims()
  const cancelClaimMutation = useCancelClaim()

  const handleCancelClaim = async (claimId: string) => {
    try {
      await cancelClaimMutation.mutateAsync(claimId)
      toast.success('Reclamación cancelada', {
        description: 'La solicitud ha sido eliminada correctamente.',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cancelar la reclamación')
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-6">
      {/* Cabecera */}
      <div>
        <Link
          to={paths.profile}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mi perfil
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Mis reclamaciones
        </h1>
        <p className="mt-1 text-muted-foreground">
          Sigue el estado de las solicitudes que has enviado para recuperar tus objetos.
        </p>
      </div>

      {/* ESTADO 1: Cargando */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex flex-col space-y-3 rounded-xl border bg-card p-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      )}

      {/* ESTADO 2: Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle className="text-base font-semibold">Error al obtener las reclamaciones</AlertTitle>
          <AlertDescription className="mt-1">
            {error instanceof Error ? error.message : 'Ocurrió un problema al cargar los datos.'}
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3 gap-2">
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* ESTADO 3: Vacío */}
      {!isLoading && !isError && (!claims || claims.length === 0) && (
        <Empty className="my-12 py-12">
          <EmptyMedia>
            <Handshake className="h-12 w-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No tienes ninguna reclamación activa</EmptyTitle>
            <EmptyDescription>
              Si has visto algún objeto en el feed que sea tuyo, puedes reclamarlo demostrando el detalle oculto.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild className="mt-4 gap-2">
            <Link to={paths.items}>
              Explorar objetos en el feed
            </Link>
          </Button>
        </Empty>
      )}

      {/* ESTADO 4: Con datos */}
      {!isLoading && !isError && claims && claims.length > 0 && (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card key={claim.id} className="transition-all hover:border-primary/40">
              <CardHeader className="p-5 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg font-bold">
                    <Link
                      to={paths.itemDetail(claim.itemId)}
                      className="hover:underline hover:text-primary"
                    >
                      {claim.itemTitle}
                    </Link>
                  </CardTitle>

                  {claim.status === 'pending' && (
                    <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      En revisión por el publicador
                    </Badge>
                  )}
                  {claim.status === 'accepted' && (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      Reclamación Aceptada
                    </Badge>
                  )}
                  {claim.status === 'rejected' && (
                    <Badge variant="destructive">
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Reclamación Rechazada
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Enviada el {formatDate(claim.createdAt)}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 p-5 pt-0">
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Detalle o prueba aportada:</span>
                  <p className="mt-1 italic text-foreground/90">"{claim.proof}"</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
                  {claim.ownerContact ? (
                    <div className="text-muted-foreground">
                      Persona que lo encontró:{' '}
                      <span className="font-medium text-foreground">{claim.ownerContact.name}</span> (
                      {claim.ownerContact.email})
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      Tu contacto enviado: <span className="font-medium text-foreground">{claim.claimantContact.name}</span> ({claim.claimantContact.email})
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {claim.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={cancelClaimMutation.isPending}
                        onClick={() => handleCancelClaim(claim.id)}
                        className="text-destructive hover:bg-destructive/10 h-8"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Cancelar reclamación
                      </Button>
                    )}

                    <Button asChild variant="outline" size="sm" className="h-8">
                      <Link to={paths.itemDetail(claim.itemId)}>
                        Ver ficha del objeto
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
