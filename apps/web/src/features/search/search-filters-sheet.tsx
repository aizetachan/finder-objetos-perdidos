import { CATEGORIES, type CategoryId, type DateFilterPeriod } from '@finder/shared'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from 'cn'
import { ALL_OPTION, DATE_PERIOD_OPTIONS } from './constants'

interface SearchFiltersSheetProps {
  category?: CategoryId
  city?: string
  period?: DateFilterPeriod
  availableCities: string[]
  onApply: (filters: {
    category?: CategoryId
    city?: string
    period?: DateFilterPeriod
  }) => void
  onReset: () => void
  triggerClassName?: string
}

export function SearchFiltersSheet({
  category,
  city,
  period,
  availableCities,
  onApply,
  onReset,
  triggerClassName,
}: SearchFiltersSheetProps) {
  const [open, setOpen] = useState(false)
  const [tempCategory, setTempCategory] = useState<CategoryId | typeof ALL_OPTION>(category ?? ALL_OPTION)
  const [tempCity, setTempCity] = useState<string | typeof ALL_OPTION>(city ?? ALL_OPTION)
  const [tempPeriod, setTempPeriod] = useState<DateFilterPeriod | typeof ALL_OPTION>(period ?? ALL_OPTION)

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setTempCategory(category ?? ALL_OPTION)
      setTempCity(city ?? ALL_OPTION)
      setTempPeriod(period ?? ALL_OPTION)
    }
    setOpen(nextOpen)
  }

  function handleApply() {
    onApply({
      category: tempCategory === ALL_OPTION ? undefined : tempCategory,
      city: tempCity === ALL_OPTION ? undefined : tempCity,
      period: tempPeriod === ALL_OPTION ? undefined : tempPeriod,
    })
    setOpen(false)
  }

  function handleReset() {
    setTempCategory(ALL_OPTION)
    setTempCity(ALL_OPTION)
    setTempPeriod(ALL_OPTION)
    onReset()
    setOpen(false)
  }

  const activeCount = (category ? 1 : 0) + (city ? 1 : 0) + (period ? 1 : 0)

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn('gap-2 shrink-0', triggerClassName)}>
          <SlidersHorizontal className="size-4" />
          <span>Filtros</span>
          {activeCount > 0 ? (
            <Badge variant="secondary" className="size-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
          <SheetDescription>
            Acota la búsqueda para encontrar el objeto más rápido.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 py-6">
          <Field>
            <FieldLabel htmlFor="filter-category">Categoría</FieldLabel>
            <Select
              value={tempCategory}
              onValueChange={(val) => setTempCategory(val as CategoryId | typeof ALL_OPTION)}
            >
              <SelectTrigger id="filter-category" className="w-full">
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
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-city">Ciudad</FieldLabel>
            <Select
              value={tempCity}
              onValueChange={(val) => setTempCity(val)}
            >
              <SelectTrigger id="filter-city" className="w-full">
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
          </Field>

          <Field>
            <FieldLabel htmlFor="filter-period">Fecha de hallazgo</FieldLabel>
            <Select
              value={tempPeriod}
              onValueChange={(val) => setTempPeriod(val as DateFilterPeriod | typeof ALL_OPTION)}
            >
              <SelectTrigger id="filter-period" className="w-full">
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
          </Field>
        </div>

        <SheetFooter className="mt-auto border-t p-4 gap-2">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
            Restablecer filtros
          </Button>
          <Button onClick={handleApply} className="w-full sm:w-auto">
            Aplicar filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
