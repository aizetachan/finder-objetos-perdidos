import { ArrowRight, HeartHandshake, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/routes/paths'

export function HomeCommunityBanner() {
  return (
    <section aria-labelledby="community-heading">
      <Card className="relative overflow-hidden rounded-2xl border bg-muted/40 transition-shadow hover:shadow-xs">
        {/* Marca de agua decorativa de fondo usando sólo opacidad semántica */}
        <HeartHandshake
          className="pointer-events-none absolute -bottom-10 -right-8 size-64 select-none text-foreground/4"
          aria-hidden
        />

        <CardContent className="relative z-10 flex flex-col gap-6 p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-2xl flex-col gap-3">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-2xs backdrop-blur-xs">
              <HeartHandshake className="size-3.5 text-primary" aria-hidden />
              <span>Comunidad Finder</span>
            </div>

            <h2
              id="community-heading"
              className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl text-foreground"
            >
              Una comunidad que devuelve las cosas a su sitio.
            </h2>

            <p className="max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed text-balance">
              Cada objeto publicado puede ser algo importante para otra persona. Finder conecta a
              quien pierde algo con quien decidió ayudar.
            </p>

            <div className="pt-2">
              <Button asChild size="lg" className="w-full sm:w-auto h-11 px-6 shadow-xs">
                <Link to={paths.publish}>
                  <span>He encontrado algo</span>
                  <ArrowRight className="size-4" data-icon="inline-end" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          {/* Gráfico decorativo de cierre para desktop sin assets externos */}
          <div className="hidden md:flex shrink-0 items-center justify-center pl-8">
            <div className="relative flex size-32 items-center justify-center rounded-full border border-border/80 bg-background/80 shadow-xs">
              <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartHandshake className="size-10 stroke-[1.75]" aria-hidden />
              </div>
              <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-background bg-foreground text-background shadow-xs">
                <Sparkles className="size-4" aria-hidden />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
