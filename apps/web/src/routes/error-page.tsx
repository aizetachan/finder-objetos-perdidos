import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

// Se muestra si una pantalla falla de forma inesperada, para no dejar la web en blanco.
export function ErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Algo ha fallado</EmptyTitle>
          <EmptyDescription>
            Ha ocurrido un error inesperado. Prueba a recargar la página.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
