import { CheckCircle2, Search, SearchCheck } from 'lucide-react'

const STEPS = [
  {
    number: '1',
    title: 'Busca',
    description: 'Cuéntanos qué has perdido. Usa el buscador, filtros por categoría o ciudad.',
    icon: Search,
  },
  {
    number: '2',
    title: 'Encuentra coincidencias',
    description: 'Revisa los objetos que otras personas han encontrado y publicado.',
    icon: SearchCheck,
  },
  {
    number: '3',
    title: 'Recupéralo',
    description: 'Si reconoces tu objeto, entra en su ficha y sigue el proceso para recuperarlo.',
    icon: CheckCircle2,
  },
] as const

export function HomeHowItWorks() {
  return (
    <section aria-labelledby="how-it-works-heading" className="flex flex-col gap-5 sm:gap-6">
      <div className="flex flex-col gap-1">
        <h2
          id="how-it-works-heading"
          className="font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          Cómo funciona
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground text-balance">
          Perder algo no debería significar perderlo para siempre.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-4 lg:gap-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isLast = index === STEPS.length - 1

          return (
            <div key={step.number} className="relative flex flex-col gap-2.5">
              {/* Encabezado del paso: número, icono, título y conector visual */}
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {step.number}
                </span>

                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-foreground shadow-2xs"
                  aria-hidden
                >
                  <Icon className="size-4" />
                </div>

                <h3 className="font-heading text-base font-semibold tracking-tight">
                  <span className="underline decoration-border underline-offset-4">{step.title}</span>
                </h3>

                {!isLast && (
                  <div
                    className="hidden h-px flex-1 bg-border/80 md:block"
                    aria-hidden
                  />
                )}
              </div>

              {/* Descripción del paso */}
              <p className="pl-10 text-xs text-muted-foreground leading-relaxed md:pl-0 sm:text-sm">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
