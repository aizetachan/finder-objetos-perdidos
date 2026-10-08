import { ArrowRight, PackageSearch, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/routes/paths'
import { SearchItemCard } from './search-item-card'
import { useSearchItems } from './use-search-items'

export function HomeRecentItems() {
  const itemsQuery = useSearchItems()

  const items = itemsQuery.data ?? []
  const recentItems = items.slice(0, 4)

  return (
    <section aria-labelledby="recent-items-heading" className="flex flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between">
        <h2
          id="recent-items-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Encontrados recientemente
        </h2>
        <Link
          to={paths.items}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 transition-colors hover:underline sm:text-sm"
        >
          <span>Ver todos los objetos</span>
          <ArrowRight className="size-3.5 sm:size-4" data-icon="inline-end" aria-hidden />
        </Link>
      </div>

      {/* 4 estados de datos */}

      {/* 1. Cargando (Skeleton) */}
      {itemsQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl sm:h-80" />
          ))}
        </div>
      ) : null}

      {/* 2. Error (Alert + reintentar) */}
      {itemsQuery.isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>No hemos podido cargar los objetos recientes</AlertTitle>
          <AlertDescription>
            Ha ocurrido un problema al consultar los datos. Por favor, inténtalo de nuevo.
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => itemsQuery.refetch()}>
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {/* 3. Vacío (Empty) */}
      {!itemsQuery.isPending && !itemsQuery.isError && recentItems.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No hay objetos publicados todavía</EmptyTitle>
            <EmptyDescription>
              Sé la primera persona en publicar un objeto encontrado para ayudar a su dueño.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm">
              <Link to={paths.publish}>Publicar objeto</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : null}

      {/* 4. Con datos (Grid de hasta 4 objetos recientes) */}
      {!itemsQuery.isPending && !itemsQuery.isError && recentItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recentItems.map((item) => (
            <SearchItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </section>
  )
}
