import { ArrowRight, Search } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paths } from '@/routes/paths'

export function HomeHero() {
  const navigate = useNavigate()
  const [isWide, setIsWide] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 640px)').matches : true,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const handler = (event: MediaQueryListEvent) => setIsWide(event.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q')?.toString().trim() ?? ''
    navigate(query ? `${paths.items}?q=${encodeURIComponent(query)}` : paths.items)
  }

  const placeholder = isWide
    ? 'Cartera marrón de piel, llaves, móvil...'
    : '¿Qué has perdido?'

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 text-center pt-2 pb-1 sm:pt-4 sm:pb-2">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          ¿Has perdido algo?
          <br />
          Vamos a encontrarlo.
        </h1>
        <p className="mx-auto max-w-lg text-sm text-muted-foreground text-balance sm:text-base">
          Busca entre los objetos encontrados y publicados por la comunidad.
        </p>
      </div>

      {/* Buscador protagonista integrado */}
      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center rounded-xl border bg-card p-1.5 shadow-xs transition-shadow focus-within:border-foreground/30 focus-within:ring-2 focus-within:ring-ring/20"
        role="search"
      >
        <Search
          className="pointer-events-none ml-2.5 size-4.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <Input
          name="q"
          type="search"
          placeholder={placeholder}
          aria-label="Qué has perdido"
          className="h-10 border-0 bg-transparent px-3 text-sm sm:text-base shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
        />
        <Button type="submit" size="default" className="h-10 px-5 text-sm font-medium shrink-0">
          Buscar
        </Button>
      </form>

      <p className="text-xs sm:text-sm text-muted-foreground">
        ¿Has encontrado algo?{' '}
        <Link
          to={paths.publish}
          className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 transition-colors hover:underline"
        >
          <span>Publicar objeto</span>
          <ArrowRight className="size-3.5" data-icon="inline-end" aria-hidden />
        </Link>
      </p>
    </section>
  )
}
