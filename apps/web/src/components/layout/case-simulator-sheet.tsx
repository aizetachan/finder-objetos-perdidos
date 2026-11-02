import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Mail, MessageSquare, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { paths } from '@/routes/paths'
import { mockTools, type MockScenarios } from '@/services/dev-tools'

interface CaseSimulatorSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CaseSimulatorSheet({ open, onOpenChange }: CaseSimulatorSheetProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const tools = mockTools

  const [scenarios, setScenarios] = useState<MockScenarios | null>(() =>
    tools ? tools.getScenarios() : null,
  )

  useEffect(() => {
    if (!tools) return
    const update = () => setScenarios(tools.getScenarios())
    update()
    window.addEventListener('finder:scenarios-changed', update)
    return () => window.removeEventListener('finder:scenarios-changed', update)
  }, [tools, open])

  if (!tools || !scenarios) return null

  const handleUpdate = <K extends keyof MockScenarios>(key: K, value: MockScenarios[K]) => {
    tools.setScenario(key, value)
    setScenarios((prev) => (prev ? { ...prev, [key]: value } : prev))
    toast.info('Escenario actualizado')
  }

  const handleResetAll = () => {
    tools.resetScenarios()
    setScenarios(tools.getScenarios())
    toast.success('Todos los escenarios han vuelto a «éxito».')
  }

  const handleSimulateOpenEmail = () => {
    onOpenChange(false)
    navigate(`${paths.verifyEmail}?code=demo`)
  }

  const handleSimulateOpenGuestEmail = () => {
    onOpenChange(false)
    navigate(`${paths.confirmGuestEmail}?code=demo-guest`)
  }

  const handleSimulateClaimNotification = () => {
    onOpenChange(false)
    navigate(`${paths.completeAccount}?code=demo`)
  }

  const handleCreateTestClaim = () => {
    if (!tools) return
    const result = tools.createTestClaimOnLastGuestItem()
    if (result.ok) {
      toast.success(result.message)
      void queryClient.invalidateQueries()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <div className="flex items-center gap-2 text-primary">
            <SlidersHorizontal className="size-5" />
            <SheetTitle className="text-lg font-bold">Simulador de casos</SheetTitle>
          </div>
          <SheetDescription className="text-xs text-muted-foreground">
            Configura el resultado de la siguiente llamada para probar errores y situaciones límite.
            Se guarda automáticamente en tu navegador.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm">
          {/* GRUPO 1: ENTRAR Y REGISTRO */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Entrar y registro
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="sim-signin" className="text-xs font-medium">
                Iniciar sesión (signIn)
              </Label>
              <Select
                value={scenarios.signIn}
                onValueChange={(val) =>
                  handleUpdate('signIn', val as MockScenarios['signIn'])
                }
              >
                <SelectTrigger id="sim-signin" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="invalid-credentials">
                    Credenciales incorrectas (invalid)
                  </SelectItem>
                  <SelectItem value="too-many-requests">
                    Demasiados intentos (too-many-requests)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-signup" className="text-xs font-medium">
                Crear cuenta (signUp)
              </Label>
              <Select
                value={scenarios.signUp}
                onValueChange={(val) =>
                  handleUpdate('signUp', val as MockScenarios['signUp'])
                }
              >
                <SelectTrigger id="sim-signup" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="already-exists">
                    Email ya existe (already-exists)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-google" className="text-xs font-medium">
                Entrar con Google (signInWithGoogle)
              </Label>
              <Select
                value={scenarios.signInWithGoogle}
                onValueChange={(val) =>
                  handleUpdate(
                    'signInWithGoogle',
                    val as MockScenarios['signInWithGoogle'],
                  )
                }
              >
                <SelectTrigger id="sim-google" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="popup-closed">
                    Ventana cerrada por el usuario (cancela sin error)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* GRUPO 2: EMAIL */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Email
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="sim-send-email" className="text-xs font-medium">
                Reenviar email de activación (sendEmailVerification)
              </Label>
              <Select
                value={scenarios.sendEmailVerification}
                onValueChange={(val) =>
                  handleUpdate(
                    'sendEmailVerification',
                    val as MockScenarios['sendEmailVerification'],
                  )
                }
              >
                <SelectTrigger id="sim-send-email" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="too-many-requests">
                    Demasiados intentos (too-many-requests)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-verify-email" className="text-xs font-medium">
                Verificar enlace del email (verifyEmail)
              </Label>
              <Select
                value={scenarios.verifyEmail}
                onValueChange={(val) =>
                  handleUpdate('verifyEmail', val as MockScenarios['verifyEmail'])
                }
              >
                <SelectTrigger id="sim-verify-email" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="expired">Enlace caducado (expired)</SelectItem>
                  <SelectItem value="already-used">
                    Enlace ya utilizado (already-used)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={handleSimulateOpenEmail}
              >
                <Mail className="size-3.5 text-primary" />
                Simular abrir el enlace del email
              </Button>
            </div>
          </div>

          <Separator />

          {/* GRUPO 2B: PUBLICAR SIN CUENTA PREVIA */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Publicar sin cuenta previa
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="sim-start-guest" className="text-xs font-medium">
                Enviar enlace de confirmación (startGuestPublish)
              </Label>
              <Select
                value={scenarios.startGuestPublish}
                onValueChange={(val) =>
                  handleUpdate('startGuestPublish', val as MockScenarios['startGuestPublish'])
                }
              >
                <SelectTrigger id="sim-start-guest" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="too-many-requests">
                    Demasiados intentos (too-many-requests)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-confirm-guest" className="text-xs font-medium">
                Confirmar enlace para publicar (confirmGuestEmail)
              </Label>
              <Select
                value={scenarios.confirmGuestEmail}
                onValueChange={(val) =>
                  handleUpdate('confirmGuestEmail', val as MockScenarios['confirmGuestEmail'])
                }
              >
                <SelectTrigger id="sim-confirm-guest" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="expired">Enlace caducado (expired)</SelectItem>
                  <SelectItem value="already-used">
                    Enlace ya utilizado (already-used)
                  </SelectItem>
                  <SelectItem value="email-has-account">
                    Email ya tiene cuenta (already-exists)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={handleSimulateOpenGuestEmail}
              >
                <Mail className="size-3.5 text-primary" />
                Simular abrir el enlace de publicar
              </Button>
            </div>
          </div>

          <Separator />

          {/* GRUPO 2C: CUENTA TEMPORAL (COMPLETAR CUENTA) */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Cuenta temporal
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="sim-guest-link" className="text-xs font-medium">
                Acceso con enlace de aviso (signInWithGuestLink)
              </Label>
              <Select
                value={scenarios.signInWithGuestLink}
                onValueChange={(val) =>
                  handleUpdate('signInWithGuestLink', val as MockScenarios['signInWithGuestLink'])
                }
              >
                <SelectTrigger id="sim-guest-link" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="expired">Enlace caducado (expired)</SelectItem>
                  <SelectItem value="already-used">
                    Enlace ya utilizado (already-used)
                  </SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-complete-guest" className="text-xs font-medium">
                Completar cuenta (completeGuestAccount)
              </Label>
              <Select
                value={scenarios.completeGuestAccount}
                onValueChange={(val) =>
                  handleUpdate('completeGuestAccount', val as MockScenarios['completeGuestAccount'])
                }
              >
                <SelectTrigger id="sim-complete-guest" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={handleSimulateClaimNotification}
              >
                <Mail className="size-3.5 text-primary" />
                Simular email «Han reclamado tu objeto»
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={handleCreateTestClaim}
                disabled={!user?.isGuest}
                title={!user?.isGuest ? 'Inicia sesión como invitado con un objeto publicado para probar' : undefined}
              >
                <MessageSquare className="size-3.5 text-primary" />
                Crear reclamación de prueba sobre mi último objeto
              </Button>
            </div>
          </div>

          <Separator />

          {/* GRUPO 3: IDENTIDAD */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Identidad
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="sim-start-identity" className="text-xs font-medium">
                Iniciar verificación (startIdentityVerification)
              </Label>
              <Select
                value={scenarios.startIdentityVerification}
                onValueChange={(val) =>
                  handleUpdate(
                    'startIdentityVerification',
                    val as MockScenarios['startIdentityVerification'],
                  )
                }
              >
                <SelectTrigger id="sim-start-identity" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-identity-result" className="text-xs font-medium">
                Resultado que devolverá el proveedor (identityResult)
              </Label>
              <Select
                value={scenarios.identityResult}
                onValueChange={(val) =>
                  handleUpdate(
                    'identityResult',
                    val as MockScenarios['identityResult'],
                  )
                }
              >
                <SelectTrigger id="sim-identity-result" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verificada (éxito)</SelectItem>
                  <SelectItem value="rejected">Rechazada (fallida)</SelectItem>
                  <SelectItem value="pending">En espera (pending)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* GRUPO 4: PUBLICAR Y RECLAMAR */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Publicar y reclamar
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="sim-create-item" className="text-xs font-medium">
                Publicar objeto (createItem)
              </Label>
              <Select
                value={scenarios.createItem}
                onValueChange={(val) =>
                  handleUpdate('createItem', val as MockScenarios['createItem'])
                }
              >
                <SelectTrigger id="sim-create-item" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sim-create-claim" className="text-xs font-medium">
                Crear reclamación (createClaim)
              </Label>
              <Select
                value={scenarios.createClaim}
                onValueChange={(val) =>
                  handleUpdate('createClaim', val as MockScenarios['createClaim'])
                }
              >
                <SelectTrigger id="sim-create-claim" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Éxito</SelectItem>
                  <SelectItem value="network-error">Error de conexión (network)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* PIE CON BOTÓN RESET */}
        <div className="border-t bg-muted/20 p-4">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-xs"
            onClick={handleResetAll}
          >
            <RotateCcw className="size-3.5" />
            Volver todo a «éxito»
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
