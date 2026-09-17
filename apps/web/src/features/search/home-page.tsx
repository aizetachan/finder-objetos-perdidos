import { Search } from 'lucide-react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paths } from '@/routes/paths'

export function HomePage() {
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q')?.toString().trim() ?? ''
    navigate(query ? `${paths.items}?q=${encodeURIComponent(query)}` : paths.items)
  }

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        ¿Has perdido algo? Puede que alguien ya lo haya encontrado.
      </h1>
      <p className="text-lg text-muted-foreground text-balance">
        Busca entre los objetos que otras personas han encontrado, o publica el que has encontrado
        tú para que vuelva a su dueño.
      </p>

      <form onSubmit={handleSubmit} className="flex w-full gap-2" role="search">
        <Input
          name="q"
          type="search"
          placeholder="Cartera, llaves, móvil…"
          aria-label="Qué has perdido"
          className="h-10"
        />
        <Button type="submit" size="lg">
          <Search data-icon="inline-start" />
          Buscar
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        ¿Has encontrado algo?{' '}
        <Link to={paths.publish} className="font-medium text-foreground underline underline-offset-4">
          Publícalo aquí
        </Link>
      </p>
    </section>
  )
}
