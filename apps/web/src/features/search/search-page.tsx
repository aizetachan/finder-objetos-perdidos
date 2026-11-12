import { CATEGORIES, type CategoryId, type DateFilterPeriod, getCategoryLabel } from '@finder/shared'
import { PackageSearch, RotateCcw, Search, TriangleAlert, X } from 'lucide-react'
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
import { ALL_OPTION, DATE_PERIOD_OPTIONS } from './constants'
import { SearchFiltersSheet } from './search-filters-sheet'
import { SearchItemCard } from './search-item-card'
import { useSearchItems } from './use-search-items'

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Lectura y validación defensiva de los search params de la URL
  const rawQ = searchParams.get('q') ?? ''
  const q = rawQ.trim()

  const rawCategory = searchParams.get('category')
  const category = rawCategory && CATEGORIES.some((c) => c.id === rawCategory)
    ? (rawCategory as CategoryId)
    : undefined

  const rawCity = searchParams.get('city')?.trim()
  const city = rawCity && rawCity !== ALL_OPTION ? rawCity : undefined

  const rawPeriod = searchParams.get('period')
  const period =
    rawPeriod === '24h' || rawPeriod === '7d' || rawPeriod === '30d'
      ? (rawPeriod as DateFilterPeriod)
      : undefined

  // 2. Estado local del input sincronizado con la URL (ajuste durante render para back/forward)
  const [prevQ, setPrevQ] = useState(rawQ)
  const [searchInput, setSearchInput] = useState(rawQ)

  if (prevQ !== rawQ) {
    setPrevQ(rawQ)
    setSearchInput(rawQ)
  }

  // 3. Obtener ciudades disponibles a través del contrato de services
  const allItemsQuery = useSearchItems()
  const availableCities = useMemo(() => {
    if (!allItemsQuery.data) return []
    const set = new Set<string>()
    for (const item of allItemsQuery.data) {
      const c = item.city?.trim()
      if (c) set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [allItemsQuery.data])

  // 4. Filtros para la consulta activa
  const activeFilters = useMemo(
    () => ({
      query: q || undefined,
      category,
      city,
      datePeriod: period,
    }),
    [q, category, city, period],
  )

  const itemsQuery = useSearchItems(activeFilters)
  const items = itemsQuery.data ?? []
  const count = items.length

  // 5. Manejadores de URL
  function updateSearchParams(updates: {
    q?: string
    category?: CategoryId | typeof ALL_OPTION
    city?: string | typeof ALL_OPTION
    period?: DateFilterPeriod | typeof ALL_OPTION
  }) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)

      if ('q' in updates) {
        const val = updates.q?.trim()
        if (val) next.set('q', val)
        else next.delete('q')
      }

      if ('category' in updates) {
        const val = updates.category
        if (val && val !== ALL_OPTION) next.set('category', val)
        else next.delete('category')
      }

      if ('city' in updates) {
        const val = updates.city
        if (val && val !== ALL_OPTION) next.set('city', val)
        else next.delete('city')
      }

      if ('period' in updates) {
        const val = updates.period
        if (val && val !== ALL_OPTION) next.set('period', val)
        else next.delete('period')
      }

      return next
    })
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateSearchParams({ q: searchInput })
  }

  function handleClearSearchInput() {
    setSearchInput('')
    updateSearchParams({ q: '' })
  }

  function handleResetAll() {
    setSearchInput('')
    setSearchParams(new URLSearchParams())
  }

  function removeFilter(key: 'q' | 'category' | 'city' | 'period') {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(key)
      return next
    })
    if (key === 'q') {
      setSearchInput('')
    }
  }

  const hasActiveFilters = Boolean(q || category || city || period)
  const currentPeriodLabel = DATE_PERIOD_OPTIONS.find((p) => p.value === period)?.label

  return (
    <div className="space-y-8 py-4">
      {/* A. CABECERA */}
      <section className="space-y-2">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">
          Buscar objetos
        </h1>
        <p className="text-base text-muted-foreground">
          Busca entre los objetos encontrados y publicados por la comunidad.
        </p>
      </section>

      {/* B. BUSCADOR PRINCIPAL Y FILTROS */}
      <section className="space-y-4">
        {/* Formulario de búsqueda principal */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2" role="search">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="¿Qué has perdido? Cartera, llaves, mochila…"
              aria-label="¿Qué has perdido?"
              className="h-11 pl-10 pr-9 text-base md:text-sm"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={handleClearSearchInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Borrar texto de búsqueda"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          <Button type="submit" size="lg" className="h-11 px-5">
            <Search data-icon="inline-start" className="md:hidden" />
            <span className="hidden md:inline">Buscar</span>
          </Button>

          {/* Botón de filtros en móvil */}
          <div className="md:hidden">
            <SearchFiltersSheet
              category={category}
              city={city}
              period={period}
              availableCities={availableCities}
              onApply={(sheetFilters) => {
                updateSearchParams({
                  category: sheetFilters.category ?? ALL_OPTION,
                  city: sheetFilters.city ?? ALL_OPTION,
                  period: sheetFilters.period ?? ALL_OPTION,
                })
              }}
              onReset={() => {
                updateSearchParams({
                  category: ALL_OPTION,
                  city: ALL_OPTION,
                  period: ALL_OPTION,
                })
              }}
              triggerClassName="h-11"
            />
          </div>
        </form>

        {/* C. CATEGORÍAS (Pills visualmente coherentes con la Home) */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          role="tablist"
          aria-label="Filtro por categoría"
        >
          <Button
            type="button"
            variant={!category ? 'default' : 'outline'}
            size="sm"
            onClick={() => updateSearchParams({ category: ALL_OPTION })}
            className="rounded-full shrink-0"
          >
            Todas
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              type="button"
              variant={category === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                updateSearchParams({
                  category: category === cat.id ? ALL_OPTION : cat.id,
                })
              }
              className="rounded-full shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* D & E. FILTROS SECUNDARIOS (Ciudad y Fecha) en Desktop */}
        <div className="hidden items-center gap-3 pt-1 md:flex">
          {/* Filtro Ciudad */}
          <Select
            value={city ?? ALL_OPTION}
            onValueChange={(val) => updateSearchParams({ city: val })}
          >
            <SelectTrigger className="w-52" aria-label="Filtrar por ciudad">
              <SelectValue placeholder="Todas las ciudades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_OPTION}>Todas las ciudades</SelectItem>
              {availableCities.map((cityName) => (
                <SelectItem key={cityName} value={cityName}>
                  {cityName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro Fecha */}
          <Select
            value={period ?? ALL_OPTION}
            onValueChange={(val) =>
              updateSearchParams({ period: val as DateFilterPeriod | typeof ALL_OPTION })
            }
          >
            <SelectTrigger className="w-52" aria-label="Filtrar por fecha">
              <SelectValue placeholder="Cualquier fecha" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Restablecer filtros
            </Button>
          ) : null}
        </div>

        {/* CHIPS DE FILTROS ACTIVOS */}
        {hasActiveFilters ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="font-medium text-muted-foreground">Filtros:</span>

            {q ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal">
                <span>Texto: «{q}»</span>
                <button
                  type="button"
                  onClick={() => removeFilter('q')}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de texto"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {category ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal">
                <span>Categoría: {getCategoryLabel(category)}</span>
                <button
                  type="button"
                  onClick={() => removeFilter('category')}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de categoría"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {city ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal">
                <span>Ciudad: {city}</span>
                <button
                  type="button"
                  onClick={() => removeFilter('city')}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de ciudad"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            {period ? (
              <Badge variant="secondary" className="gap-1.5 py-1 pl-2.5 pr-1.5 font-normal">
                <span>Fecha: {currentPeriodLabel}</span>
                <button
                  type="button"
                  onClick={() => removeFilter('period')}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label="Quitar filtro de fecha"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ) : null}

            <button
              type="button"
              onClick={handleResetAll}
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Limpiar todos
            </button>
          </div>
        ) : null}
      </section>

      {/* F. RESULTADOS Y CONTADOR */}
      {!itemsQuery.isPending && !itemsQuery.isError ? (
        <div className="flex items-center justify-between text-sm text-muted-foreground" aria-live="polite">
          <p>{count === 1 ? '1 objeto encontrado' : `${count} objetos encontrados`}</p>
        </div>
      ) : null}

      {/* ESTADOS OBLIGATORIOS */}

      {/* 1. ESTADO DE CARGA: Skeleton */}
      {itemsQuery.isPending ? (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Cargando objetos"
        >
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl sm:h-80" />
          ))}
        </div>
      ) : null}

      {/* 2. ESTADO DE ERROR: Alert con Reintentar */}
      {itemsQuery.isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="size-4" />
          <AlertTitle>No hemos podido cargar los objetos</AlertTitle>
          <AlertDescription>
            Ha ocurrido un problema al consultar los datos. Por favor, inténtalo de nuevo.
          </AlertDescription>
          <AlertAction>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => itemsQuery.refetch()}
            >
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {/* 3. ESTADO VACÍO: Empty */}
      {!itemsQuery.isPending && !itemsQuery.isError && count === 0 ? (
        <Empty className="border border-dashed py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PackageSearch className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>No encontramos ningún objeto con estos filtros</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? 'Prueba a cambiar los términos de búsqueda o a eliminar algún filtro para ver más resultados.'
                : 'Aún no se ha publicado ningún objeto en la comunidad.'}
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters ? (
            <EmptyContent>
              <Button type="button" variant="outline" size="sm" onClick={handleResetAll}>
                <RotateCcw className="size-3.5" data-icon="inline-start" />
                Restablecer filtros
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : null}

      {/* 4. ESTADO CON DATOS: Grid responsive */}
      {!itemsQuery.isPending && !itemsQuery.isError && count > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <SearchItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
