import { CATEGORIES, type CategoryId } from '@finder/shared'
import {
  FilterX,
  MapPin,
  PackageSearch,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Empty,
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
import { ItemCard } from './item-card'
import { useSearchItems } from './use-search-items'

const ALL_CATEGORIES = 'all'
const ALL_CITIES = 'all'

type SortOption = 'newest' | 'oldest' | 'title'

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES)
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES)
  const [typeFilter, setTypeFilter] = useState<'all' | 'found' | 'lost'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  // Preparamos los filtros para el hook useSearchItems
  const apiFilters = useMemo(() => {
    return {
      query: searchQuery.trim() || undefined,
      category: selectedCategory !== ALL_CATEGORIES ? (selectedCategory as CategoryId) : undefined,
      city: selectedCity !== ALL_CITIES ? selectedCity : undefined,
    }
  }, [searchQuery, selectedCategory, selectedCity])

  const { data: items, isLoading, isError, error, refetch } = useSearchItems(apiFilters)

  // Filtrado local adicional (por tipo si aplica) y ordenación
  const filteredItems = useMemo(() => {
    if (!items) return []
    let result = [...items]

    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter)
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

    return result
  }, [items, typeFilter, sortBy])

  // Obtener la lista única de ciudades a partir de los datos cargados o mock
  const availableCities = useMemo(() => {
    if (!items) return []
    const citiesSet = new Set(items.map((item) => item.city).filter(Boolean))
    return Array.from(citiesSet).sort()
  }, [items])

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== ALL_CATEGORIES ||
    selectedCity !== ALL_CITIES ||
    typeFilter !== 'all'

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory(ALL_CATEGORIES)
    setSelectedCity(ALL_CITIES)
    setTypeFilter('all')
    setSortBy('newest')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-6">
      {/* Cabecera principal */}
      <div className="space-y-2 text-center md:text-left">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Feed de objetos perdidos y encontrados
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explora todas las publicaciones de la comunidad o busca lo que has perdido.
          </p>
        </div>
      </div>

      {/* Panel de filtros y búsqueda */}
      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        {/* Fila 1: Buscador y selección de tipo */}
        <div className="grid gap-3 sm:grid-cols-12">
          {/* Campo de búsqueda */}
          <div className="relative sm:col-span-8 md:col-span-9">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, descripción o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Selector de Tipo (Todos / Encontrados / Perdidos) */}
          <div className="sm:col-span-4 md:col-span-3">
            <div className="flex rounded-lg border bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`flex-1 rounded-md py-1.5 font-medium transition-all ${
                  typeFilter === 'all'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('found')}
                className={`flex-1 rounded-md py-1.5 font-medium transition-all ${
                  typeFilter === 'found'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Encontrados
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('lost')}
                className={`flex-1 rounded-md py-1.5 font-medium transition-all ${
                  typeFilter === 'lost'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Perdidos
              </button>
            </div>
          </div>
        </div>

        {/* Fila 2: Categoría, Ciudad y Ordenación */}
        <div className="grid gap-3 sm:grid-cols-12">
          {/* Desplegable Categoría */}
          <div className="sm:col-span-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <div className="flex items-center gap-2 truncate">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Categoría" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desplegable Ciudad */}
          <div className="sm:col-span-4">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Ciudad" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CITIES}>Todas las ciudades</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ordenación */}
          <div className="sm:col-span-4">
            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes primero</SelectItem>
                <SelectItem value="oldest">Más antiguos primero</SelectItem>
                <SelectItem value="title">Título (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chips de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Filtros activos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Texto: "{searchQuery}"
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
              {selectedCategory !== ALL_CATEGORIES && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Categoría:{' '}
                  {CATEGORIES.find((c) => c.id === selectedCategory)?.label || selectedCategory}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedCategory(ALL_CATEGORIES)}
                  />
                </Badge>
              )}
              {selectedCity !== ALL_CITIES && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Ciudad: {selectedCity}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedCity(ALL_CITIES)}
                  />
                </Badge>
              )}
              {typeFilter !== 'all' && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Tipo: {typeFilter === 'found' ? 'Encontrados' : 'Perdidos'}
                  <X
                    className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                    onClick={() => setTypeFilter('all')}
                  />
                </Badge>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <FilterX className="mr-1 h-3.5 w-3.5" />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* ESTADO 1: Cargando (Skeleton Grid) */}
      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="flex flex-col space-y-3 rounded-xl border bg-card p-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="mt-4 h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {/* ESTADO 2: Error */}
      {isError && (
        <Alert variant="destructive">
          <AlertTitle className="text-base font-semibold">Error al cargar los objetos</AlertTitle>
          <AlertDescription className="mt-1">
            {error instanceof Error
              ? error.message
              : 'Ocurrió un problema inesperado al consultar los datos.'}
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-3 gap-2">
              <RotateCcw className="h-4 w-4" />
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* ESTADO 3: Vacío (Sin resultados) */}
      {!isLoading && !isError && filteredItems.length === 0 && (
        <Empty className="my-12 py-12">
          <EmptyMedia>
            <PackageSearch className="h-12 w-12 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No se encontraron objetos</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? 'No hay publicaciones que coincidan con los filtros seleccionados. Pruebe a cambiar o limpiar los términos de búsqueda.'
                : 'Actualmente no hay objetos registrados en el sistema.'}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearAllFilters} className="mt-4 gap-2">
              <FilterX className="h-4 w-4" />
              Limpiar todos los filtros
            </Button>
          )}
        </Empty>
      )}

      {/* ESTADO 4: Con Datos (Feed Grid) */}
      {!isLoading && !isError && filteredItems.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

