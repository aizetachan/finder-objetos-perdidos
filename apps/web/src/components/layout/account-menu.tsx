import { useQueryClient } from '@tanstack/react-query'
import { FlaskConical, LogOut, RotateCcw } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { resetDemoChatFlow, usePendingClaims } from '@/hooks/use-claims-notification'
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { mockTools } from '@/services/dev-tools'

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function AccountMenu() {
  const { user, loading } = useAuth()
  const queryClient = useQueryClient()
  const tools = mockTools

  // Estado reactivo de notificaciones sincronizado con localStorage (finder:has-read-claims).
  const storedPendingClaims = usePendingClaims()
  const pendingClaims = user ? storedPendingClaims : 0

  // Al cambiar de persona, los datos ya pedidos (mis publicaciones, etc.) dejan de valer.
  const refreshData = () => queryClient.invalidateQueries()

  if (loading) return <Skeleton className="size-8 rounded-full" />

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {user ? (
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Mi cuenta">
            <div className="relative">
              <Avatar>
                <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
              </Avatar>
              {pendingClaims > 0 ? (
                <span
                  className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-background"
                  aria-hidden
                />
              ) : null}
            </div>
          </Button>
        ) : (
          <Button variant="ghost">Entrar</Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        {user ? (
          <>
            <DropdownMenuLabel>
              <p className="font-medium text-foreground">{user.displayName}</p>
              <p className="font-normal">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to={paths.profile}>Mi perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={paths.myItems}>Mis publicaciones</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={paths.myClaims}>Mis reclamaciones</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  to={paths.claimReview('FND-8492')}
                  className="flex items-center justify-between gap-2"
                >
                  <span>Mensajes</span>
                  {pendingClaims > 0 ? (
                    <Badge variant="destructive" className="ml-auto shrink-0">
                      {pendingClaims} nuevo
                    </Badge>
                  ) : null}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link to={paths.login}>Entrar</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={paths.register}>Crear cuenta</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}

        {tools ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-1.5">
              <FlaskConical className="size-3.5" aria-hidden />
              Datos de ejemplo: entrar como…
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              {tools.getMockAccounts().map((account) => (
                <DropdownMenuItem
                  key={account.id}
                  disabled={account.id === user?.id}
                  onSelect={() => {
                    tools.switchMockUser(account.id)
                    refreshData()
                  }}
                >
                  {account.displayName}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onSelect={() => {
                  tools.resetMockData()
                  resetDemoChatFlow()
                  refreshData()
                  toast.success('Datos de ejemplo restaurados')
                }}
              >
                <RotateCcw />
                Restaurar datos de ejemplo
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}

        {user ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async () => {
                await services.signOut()
                refreshData()
              }}
            >
              <LogOut />
              Salir
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
