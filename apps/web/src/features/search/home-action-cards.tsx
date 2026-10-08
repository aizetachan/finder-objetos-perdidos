import { ArrowRight, Search, Tag } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { paths } from '@/routes/paths'

export function HomeActionCards() {
  return (
    <section aria-label="Acciones principales" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Tarjeta 1: He perdido algo */}
      <Card className="flex flex-col justify-between border bg-card/70 p-5 sm:p-6 transition-all hover:bg-card hover:shadow-xs">
        <div className="flex items-start gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border/80 bg-muted text-foreground sm:size-12"
            aria-hidden
          >
            <Search className="size-5" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <CardTitle className="font-heading text-lg font-semibold sm:text-xl">
              He perdido algo
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Busca por nombre, categoría o ciudad entre los objetos encontrados por la comunidad.
            </CardDescription>
            <div className="pt-2">
              <Button asChild size="default" className="w-full sm:w-auto">
                <Link to={paths.items}>
                  <span>Buscar objetos</span>
                  <ArrowRight className="size-3.5" data-icon="inline-end" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tarjeta 2: He encontrado algo */}
      <Card className="flex flex-col justify-between border bg-card/70 p-5 sm:p-6 transition-all hover:bg-card hover:shadow-xs">
        <div className="flex items-start gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary sm:size-12"
            aria-hidden
          >
            <Tag className="size-5" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <CardTitle className="font-heading text-lg font-semibold sm:text-xl">
              He encontrado algo
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed sm:text-sm">
              Publícalo en menos de un minuto para ayudar a que vuelva a su dueño.
            </CardDescription>
            <div className="pt-2">
              <Button asChild size="default" className="w-full sm:w-auto">
                <Link to={paths.publish}>
                  <span>Publicar objeto</span>
                  <ArrowRight className="size-3.5" data-icon="inline-end" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
