import { Outlet } from 'react-router'
import { Footer } from './footer'
import { Header } from './header'

// Estructura común de todas las pantallas: cabecera, contenido y pie.
export function AppLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
