import { CATEGORIES, type CategoryId, getCategoryLabel } from '@finder/shared'
import { PackageSearch, Search, TriangleAlert, X } from 'lucide-react'
import { type FormEvent, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ALL_OPTION, POPULAR_CITIES } from './constants'
import { SearchFiltersSheet } from './search-filters-sheet'
import { SearchItemCard } from './search-item-card'
import { useSearchItems } from './use-search-items'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const q = searchParams.get('q') ?? ''
  const category = (searchParams.get('category') as CategoryId) || undefined
  const city = searchParams.get('city') || undefined

  // Ajustar estado local cuando cambia la URL sin necesitar un effect síncrono
  const [prevQ, setPrevQ] = useState(q)
  const [searchInput, setSearchInput] = useState(q)

  if (prevQ !== q) {
    setPrevQ(q)
    setSearchInput(q)
  }

  const filters = useMemo(
    () => ({
      query: q || undefined,
      category,
      city,
    }),
    [q, category, city],
  )

  const itemsQuery = useSearchItems(filters)

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = searchInput.trim()
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (trimmed) {
        next.set('q', trimmed)
      } else {
        next.delete('q')
      }
      return next
    })
  }

  function handleClearSearchInput() {
    setSearchInput('')
    if (q) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('q')
        return next
      })
    }
  }

  function handleApplySheetFilters(newFilters: { category?: CategoryId; city?: string }) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newFilters.category) {
        next.set('category', newFilters.category)
      } else {
        next.delete('category')
      }
      if (newFilters.city) {
        next.set('city', newFilters.city)
      } else {
        next.delete('city')
      }
      return next
    })
  }

  function handleCategoryChange(val: CategoryId | typeof ALL_OPTION) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val === ALL_OPTION) {
        next.delete('category')
      } else {
        next.set('category', val)
      }
      return next
    })
  }

  function handleCityChange(val: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (val === ALL_OPTION) {
        next.delete('city')
      } else {
        next.set('city', val)
      }
      return next
    })
  }

  function handleResetAll() {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  function removeFilter(key: 'q' | 'category' | 'city') {
    if (key === 'q') {
      setSearchInput('')
    }
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(key)
      return next
    })
  }

  const hasActiveFilters = Boolean(q || category || city)
  const items = itemsQuery.data ?? []
  const count = items.length

  const counterText = q
    ? `${count} ${count === 1 ? 'resultado' : 'resultados'} para «${q}»`
    : `${count} ${count === 1 ? 'objeto publicado' : 'objetos publicados'}`

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* 1. Encabezado principal */}
      <header className="flex flex-col gap-1.5">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          ¿Has perdido algo?
        </h1>
        <p className="text-base text-muted-foreground text-balance">
          Busca entre los objetos que otras personas han encontrado.
        </p>
      </header>

      {/* 2. Barra de búsqueda y controles de filtro */}
      <section className="flex flex-col gap-3" aria-label="Búsqueda y filtros">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3" role="search">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {/* Fila 1 en móvil / Campo principal en desktop: 100% de ancho en móvil */}
            <div className="relative w-full md:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                name="q"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="¿Qué has perdido? Ej. llaves, cartera, mochila..."
                className="h-11 w-full pl-10 pr-9 text-base shadow-xs"
                aria-label="¿Qué has perdido?"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={handleClearSearchInput}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xs p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Borrar texto de búsqueda"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            {/* Fila 2 en móvil: Buscar + Filtros */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <Button type="submit" size="lg" className="h-11 w-full">
                Buscar
              </Button>
              <SearchFiltersSheet
                category={category}
                city={city}
                onApply={handleApplySheetFilters}
                onReset={() => {
                  removeFilter('category')
                  removeFilter('city')
                }}
                triggerClassName="h-11 w-full justify-center"
              />
            </div>

            {/* En desktop: botón Buscar directo en la fila principal */}
            <Button type="submit" size="lg" className="hidden h-11 px-5 md:inline-flex">
              Buscar
            </Button>
          </div>

          {/* En desktop: filtros accesibles horizontalmente */}
          <div className="hidden items-center gap-2 md:flex">
            <Select
              value={category ?? ALL_OPTION}
              onValueChange={(val) => handleCategoryChange(val as CategoryId | typeof ALL_OPTION)}
            >
              <SelectTrigger className="w-56" aria-label="Filtrar por categoría">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={city ?? ALL_OPTION}
              onValueChange={handleCityChange}
            >
              <SelectTrigger className="w-48" aria-label="Filtrar por ciudad">
                <SelectValue placeholder="Todas las ciudades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_OPTION}>Todas las ciudades</SelectItem>
                {POPULAR_CITIES.map((cityName) => (
                  <SelectItem key={cityName} value={cityName}>
                    {cityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Restablecer filtros
              </Button>
            ) : null}
          </div>
        </form>

        {/* 3. Chips de filtros activos */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-muted-foreground">Filtros:</span>

            {category ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 text-xs font-normal">
                <span>Categoría: {getCategoryLabel(category)}</span>
                <button
                  type="button"
                  onClick={() => removeFilter('category')}
                  className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de categoría"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {city ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 text-xs font-normal">
                <span>Ciudad: {city}</span>
                <button
                  type="button"
                  onClick={() => removeFilter('city')}
                  className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de ciudad"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {q ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 text-xs font-normal">
                <span>Texto: «{q}»</span>
                <button
                  type="button"
                  onClick={() => removeFilter('q')}
                  className="rounded-full p-0.5 transition-colors hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de texto"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            <button
              type="button"
              onClick={handleResetAll}
              className="ml-1 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Limpiar todos
            </button>
          </div>
        ) : null}
      </section>

      {/* 4. Contador de resultados */}
      {!itemsQuery.isPending && !itemsQuery.isError ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground" aria-live="polite">
          <p>{counterText}</p>
        </div>
      ) : null}

      {/* 5. Área de resultados — 4 estados */}

      {/* Estado 1: Cargando (Skeleton) */}
      {itemsQuery.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-xl sm:h-80" />
          ))}
        </div>
      ) : null}

      {/* Estado 2: Error (Alert) */}
      {itemsQuery.isError ? (
        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>No hemos podido cargar los objetos</AlertTitle>
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

      {/* Estado 3: Vacío (Empty) */}
      {!itemsQuery.isPending && !itemsQuery.isError && count === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageSearch className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No encontramos coincidencias</EmptyTitle>
            <EmptyDescription>
              Prueba con términos más generales o cambia los filtros. Puede que quien lo haya encontrado aún no lo haya publicado.
            </EmptyDescription>
          </EmptyHeader>

          {hasActiveFilters ? (
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={handleResetAll}>
                Restablecer búsqueda
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : null}

      {/* Estado 4: Con datos (Grid) */}
      {!itemsQuery.isPending && !itemsQuery.isError && count > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <SearchItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
