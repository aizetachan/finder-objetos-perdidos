import { placeholderPhoto } from '@finder/shared'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { markClaimsAsRead } from '@/hooks/use-claims-notification'
import { paths } from '@/routes/paths'

const BLACK_WALLET_PHOTO =
  'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80'

export function ClaimReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const claimCode = id ?? 'FND-8492'
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)

  function handleAcceptAndOpenChat() {
    markClaimsAsRead()
    toast.success('Reclamación aceptada. Abriendo chat seguro…')
    navigate(paths.claimChat(claimCode))
  }

  function handleConfirmDiscardClaim() {
    markClaimsAsRead()
    setIsDiscardDialogOpen(false)
    toast.success('Reclamación descartada. El objeto vuelve a estar activo en el catálogo.')
    navigate(paths.claimDiscarded)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-1 pb-10 sm:px-2">
      {/* Navegación superior de retorno */}
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2.5 text-muted-foreground hover:text-foreground"
        >
          <Link to={paths.myItems}>← Volver a Mis publicaciones</Link>
        </Button>
      </div>

      {/* Cabecera de revisión */}
      <header className="space-y-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Reclamación de tu objeto
        </h1>
        <div>
          <Badge
            variant="secondary"
            className="h-auto max-w-full px-3 py-1 text-left text-xs font-medium whitespace-normal"
          >
            🔒 #{claimCode} · Objeto bloqueado preventivamente (En revisión)
          </Badge>
        </div>
      </header>

      {/* Cuerpo comparativo: 1 columna en móvil, 2 columnas en desktop */}
      <section
        aria-label="Comparativa entre tu publicación y la reclamación recibida"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
      >
        {/* Tarjeta A: Tu publicación */}
        <Card className="flex h-full flex-col shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Ficha original
            </CardDescription>
            <CardTitle>Tu publicación</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4 pt-1">
            <div className="flex items-center gap-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted shadow-xs sm:size-24">
                <img
                  src={BLACK_WALLET_PHOTO}
                  alt="Cartera negra de piel"
                  className="size-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = placeholderPhoto('Cartera negra')
                  }}
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <Badge variant="outline" className="text-xs font-normal">
                  Carteras y bolsos
                </Badge>
                <h2 className="font-heading text-base font-semibold text-foreground sm:text-lg">
                  Cartera negra de piel
                </h2>
                <p className="text-xs text-muted-foreground">
                  Publicada por ti · Bloqueada temporalmente
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">
                  Tu preferencia: Dejar en punto seguro / comisaría
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta B: La Reclamación de Carlos R. */}
        <Card className="flex h-full flex-col shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">
                  Persona verificada
                </CardDescription>
                <CardTitle>La Reclamación de Carlos R.</CardTitle>
              </div>
              <Avatar size="sm">
                <AvatarFallback>CR</AvatarFallback>
              </Avatar>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between space-y-4 pt-1">
            <div className="space-y-3">
              <div>
                <Badge
                  variant="outline"
                  className="h-auto border-green-200 bg-green-100 px-2.5 py-1 text-xs font-medium whitespace-normal text-green-800 dark:border-green-800/60 dark:bg-green-950/50 dark:text-green-300"
                >
                  ✓ Detalle de seguridad superado
                </Badge>
              </div>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm leading-relaxed text-foreground shadow-2xs">
                Respuesta: Tiene una pegatina azul en el bolsillo interior
              </div>
            </div>

            <div className="space-y-3">
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <p className="font-medium text-foreground">
                  Preferencia de entrega: En mano en lugar público
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Avisos de mediación logística y privacidad Zero-Exposure */}
      <section aria-label="Avisos de mediación y privacidad" className="space-y-3">
        <Alert className="border-blue-200 bg-blue-50 p-3.5 text-blue-900 shadow-2xs sm:p-4 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200">
          <AlertDescription className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
            ℹ️ Carlos R. prefiere quedar en persona, pero tú indicaste dejarlo en un punto seguro.
            En el chat podréis acordar la opción que os resulte más cómoda a ambos.
          </AlertDescription>
        </Alert>

        <Alert className="border-dashed bg-muted/20 p-3.5 sm:p-4">
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            🔒 Tus datos personales (email y teléfono) están protegidos. No son visibles para la
            otra persona.
          </AlertDescription>
        </Alert>
      </section>

      {/* Botonera inferior Mobile-First */}
      <footer className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleAcceptAndOpenChat}
          className="w-full sm:flex-1"
        >
          Aceptar y abrir chat seguro 💬
        </Button>

        <Dialog open={isDiscardDialogOpen} onOpenChange={setIsDiscardDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto">
              Descartar reclamación
            </Button>
          </DialogTrigger>
          <DialogContent showCloseButton={false} className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>¿Descartar esta reclamación?</DialogTitle>
              <DialogDescription>
                El objeto #{claimCode} volverá a estar visible y activo en el catálogo público para
                que otras personas puedan reclamarlo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Volver a la revisión
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDiscardClaim}
              >
                Sí, descartar y reactivar objeto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </footer>
    </div>
  )
}

