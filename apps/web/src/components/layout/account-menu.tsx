import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FlaskConical, LogOut, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react'
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
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { mockTools } from '@/services/dev-tools'
import { CaseSimulatorSheet } from './case-simulator-sheet'

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
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)

  // Al cambiar de persona, los datos ya pedidos (mis publicaciones, etc.) dejan de valer.
  const refreshData = () => queryClient.invalidateQueries()

  if (loading) return <Skeleton className="size-8 rounded-full" />

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {user ? (
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Mi cuenta">
              <Avatar>
                <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Button variant="ghost">Entrar</Button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          {user ? (
            <>
              <DropdownMenuLabel>
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-foreground">{user.displayName}</p>
                  {user.isGuest ? (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                      Invitado
                    </Badge>
                  ) : null}
                </div>
                <p className="font-normal text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {user.isGuest ? (
                  <DropdownMenuItem asChild className="font-semibold text-primary">
                    <Link to={paths.completeAccount}>
                      <Sparkles className="mr-1.5 size-4 text-primary" />
                      Completar cuenta
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link to={paths.profile}>Mi perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={paths.myItems}>Mis publicaciones</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={paths.myClaims}>Mis reclamaciones</Link>
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
                    refreshData()
                    toast.success('Datos de ejemplo restaurados')
                  }}
                >
                  <RotateCcw />
                  Restaurar datos de ejemplo
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setIsSimulatorOpen(true)}>
                  <SlidersHorizontal className="size-3.5" />
                  Simular casos…
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

      {tools ? (
        <CaseSimulatorSheet open={isSimulatorOpen} onOpenChange={setIsSimulatorOpen} />
      ) : null}
    </>
  )
}
