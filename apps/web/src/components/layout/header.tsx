import { Menu, Plus, Search } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'
import { AccountMenu } from './account-menu'

const navLinks = [
  { to: paths.items, label: 'Buscar objetos' },
  // Temporales (ver docs/DECISIONES.md):
  { to: paths.example, label: 'Ejemplo' },
  { to: paths.styleguide, label: 'Guía de estilos' },
]

export function Header() {
  const { user } = useAuth()
  const isUnverified = Boolean(user && !user.emailVerified && !user.isGuest)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to={paths.home} className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Search className="size-5" aria-hidden />
          Finder
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'bg-muted text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {isUnverified ? (
            <Badge
              variant="outline"
              asChild
              className="border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <Link to={paths.verifyEmailPending} state={{ email: user?.email }}>
                Verifica tu email
              </Link>
            </Badge>
          ) : null}
          {user?.isGuest ? (
            <Badge
              variant="outline"
              asChild
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              <Link to={paths.completeAccount}>
                Completar cuenta
              </Link>
            </Badge>
          ) : null}
          <Button asChild className="hidden md:inline-flex">
            <Link to={paths.publish}>
              <Plus data-icon="inline-start" />
              Publicar objeto
            </Link>
          </Button>
          <AccountMenu />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Finder</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      cn(
                        'rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground',
                        isActive && 'bg-muted text-foreground',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Button asChild className="mt-2">
                  <Link to={paths.publish}>
                    <Plus data-icon="inline-start" />
                    Publicar objeto
                  </Link>
                </Button>
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
