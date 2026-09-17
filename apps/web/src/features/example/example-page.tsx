import { CATEGORIES, type CategoryId } from '@finder/shared'
import { PackageSearch, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { ItemCard } from './item-card'
import { QuickPublishDialog } from './quick-publish-dialog'
import { useItems } from './use-example-items'

const ALL = 'all'

// PANTALLA DE REFERENCIA (temporal). Lee el README.md de esta carpeta.
export function ExamplePage() {
  const { user } = useAuth()
  const [category, setCategory] = useState<CategoryId | typeof ALL>(ALL)
  const items = useItems(category === ALL ? undefined : { category })

  return (
    <>
      <PageHeader
        title="Ejemplo: objetos encontrados"
        description="Pantalla de referencia: pide datos, filtra, y publica con un formulario."
        actions={
          <>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryId | typeof ALL)}>
              <SelectTrigger className="w-48" aria-label="Filtrar por categoría">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Todas las categorías</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user ? <QuickPublishDialog /> : null}
          </>
        }
      />

      {/* Estado 1: cargando */}
      {items.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : null}

      {/* Estado 2: error */}
      {items.isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>No se han podido cargar los objetos</AlertTitle>
          <AlertDescription>Comprueba tu conexión e inténtalo de nuevo.</AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => items.refetch()}>
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {/* Estado 3: vacío */}
      {items.data?.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageSearch />
            </EmptyMedia>
            <EmptyTitle>No hay objetos en esta categoría</EmptyTitle>
            <EmptyDescription>Prueba con otra categoría o vuelve más tarde.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {/* Estado 4: con datos */}
      {items.data && items.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.data.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </>
  )
}
