import { CATEGORIES, type CategoryId } from '@finder/shared'
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  HelpCircle,
  Lock,
  MessageSquareQuote,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/routes/paths'
import { ItemCard } from './item-card'
import { useSearchItems } from './use-search-items'

const ALL_CATEGORIES = 'all'

const TESTIMONIALS = [
  {
    name: 'Laura M.',
    city: 'Madrid',
    item: 'Mochila con portátil',
    initials: 'LM',
    comment: '¡Increíble! Perdí mi mochila en el parque y en menos de 24h la persona que la encontró me contactó gracias al detalle del llavero interno. 100% agradecida.',
    stars: 5,
  },
  {
    name: 'Carlos G.',
    city: 'Barcelona',
    item: 'Llaves de coche',
    initials: 'CG',
    comment: 'Pensaba que las había perdido para siempre. Quien las encontró comprobó la marca de la funda oculta y pudimos quedar por la tarde para la entrega.',
    stars: 5,
  },
  {
    name: 'Sofía R.',
    city: 'Valencia',
    item: 'Gafas de sol',
    initials: 'SR',
    comment: 'La idea de los detalles ocultos es genial para evitar que cualquiera reclame cosas que no son suyas. Muy fácil e intuitivo.',
    stars: 5,
  },
  {
    name: 'David P.',
    city: 'Sevilla',
    item: 'Carpeta de documentos',
    initials: 'DP',
    comment: 'Recuperé la documentación de mi empresa gracias a un chico super amable que la encontró en el tranvía y la publicó de inmediato.',
    stars: 5,
  },
  {
    name: 'Elena V.',
    city: 'Bilbao',
    item: 'Reloj antiguo',
    initials: 'EV',
    comment: 'Un reloj familiar con un gran valor sentimental. El detalle de la inscripción trasera sirvió para confirmar sin dudas que era mío.',
    stars: 5,
  },
  {
    name: 'Marcos T.',
    city: 'Zaragoza',
    item: 'Auriculares inalámbricos',
    initials: 'MT',
    comment: 'Los olvidé en la biblioteca y alguien los publicó en Finder esa misma tarde. Una comunidad honesta y eficiente.',
    stars: 5,
  },
]

const FAQS = [
  {
    question: '¿Cómo funciona la regla de los "detalles ocultos"?',
    answer:
      'Cuando publicas un objeto encontrado, registras datos públicos (foto general, lugar, fecha) y un "detalle oculto" privado (ej. una marca interior, un grabado o el contenido exacto). Quien lo reclama debe describir ese detalle para demostrar que es el verdadero dueño.',
  },
  {
    question: '¿Tiene algún coste usar Finder?',
    answer:
      'Ninguno. Finder es una plataforma 100% comunitaria y gratuita pensada para ayudar a que los objetos perdidos vuelvan a sus dueños sin ánimo de lucro.',
  },
  {
    question: '¿Se ven mis datos de contacto de forma pública?',
    answer:
      'No. Tus datos de contacto nunca son públicos. Al reclamar un objeto, compartes tu contacto de forma privada con la persona que lo encontró. Si esta persona acepta la comprobación, se comparten los datos de ambos para acordar la devolución.',
  },
  {
    question: '¿Qué hago si encuentro un objeto en la calle?',
    answer:
      'Tómale una foto clara, pulsa en "He encontrado un objeto", completa la ubicación aproximada donde lo hallaste y no olvides añadir el detalle oculto para proteger la entrega.',
  },
  {
    question: '¿Qué ocurre si nadie reclama un objeto que he publicado?',
    answer:
      'El objeto permanecerá activo en la lista pública de Finder. Puedes revisar periódicamente tus publicaciones en "Mis publicaciones" o actualizar la información si fuera necesario.',
  },
  {
    question: '¿Puedo cancelar o modificar una publicación o reclamación?',
    answer:
      'Sí, desde tu panel personal ("Mis publicaciones" o "Mis reclamaciones") puedes gestionar el estado de tus objetos publicados y tus solicitudes enviadas.',
  },
  {
    question: '¿Cómo compruebo si la respuesta de quien reclama es correcta?',
    answer:
      'Como persona que publicó el objeto, recibirás en tu panel la descripción aportada por quien reclama. Tú eres quien compara su respuesta con el detalle oculto que registraste al principio para aceptar o rechazar la reclamación.',
  },
]

export function BorjaHomePage() {
  const navigate = useNavigate()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | typeof ALL_CATEGORIES>(ALL_CATEGORIES)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const items = useSearchItems(selectedCategory === ALL_CATEGORIES ? undefined : { category: selectedCategory })

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('q')?.toString().trim() ?? ''
    navigate(query ? `${paths.items}?q=${encodeURIComponent(query)}` : paths.items)
  }

  function toggleFaq(index: number) {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  function scrollCarousel(direction: 'left' | 'right') {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-16 py-4">
      {/* 1. Hero Principal */}
      <section className="relative overflow-hidden rounded-3xl border bg-muted/40 p-6 sm:p-10 md:p-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center space-y-6">
          <Badge variant="outline" className="px-3 py-1 text-xs sm:text-sm font-medium gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> Buscador de Objetos Perdidos
          </Badge>

          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Perdido no es olvidado.
          </h1>

          <p className="max-w-2xl text-base text-muted-foreground text-balance sm:text-lg">
            Cada objeto que encuentras merece una oportunidad de volver a su dueño. Entra, busca o publica lo que has encontrado.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button asChild size="lg" className="rounded-full">
              <Link to={paths.publish}>
                <Plus data-icon="inline-start" />
                He encontrado un objeto
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to={paths.items}>
                He perdido un objeto
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {/* Buscador directo en el Hero */}
          <form onSubmit={handleSearchSubmit} className="mt-4 flex w-full max-w-xl gap-2 rounded-2xl border bg-background p-2 shadow-sm" role="search">
            <Input
              name="q"
              type="search"
              placeholder="¿Qué estás buscando? (ej. cartera, llaves, mochila…)"
              aria-label="Qué has perdido"
              className="border-0 shadow-none focus-visible:ring-0"
            />
            <Button type="submit" className="rounded-xl px-5">
              <Search data-icon="inline-start" />
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* 2. Filtro por Categorías (Pills) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Explora por categorías</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button
            variant={selectedCategory === ALL_CATEGORIES ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(ALL_CATEGORIES)}
            className="rounded-full shrink-0"
          >
            Todas
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full shrink-0"
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </section>

      {/* 3. Rejilla de Objetos (4 estados contemplados) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Objetos recientes</h2>
            <p className="text-sm text-muted-foreground">Objetos encontrados recientemente por la comunidad</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to={paths.items}>
              Ver todos
              <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        {/* Estado 1: Cargando */}
        {items.isPending ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : null}

        {/* Estado 2: Error */}
        {items.isError ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>No se han podido cargar los objetos</AlertTitle>
            <AlertDescription>Comprueba tu conexión e inténtalo de nuevo.</AlertDescription>
            <AlertAction>
              <Button variant="outline" size="sm" onClick={() => items.refetch()}>
                Reintentar
              </Button>
            </AlertAction>
          </Alert>
        ) : null}

        {/* Estado 3: Vacío */}
        {items.data?.length === 0 ? (
          <Empty className="border border-dashed rounded-2xl py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageSearch />
              </EmptyMedia>
              <EmptyTitle>No hay objetos publicados en esta categoría</EmptyTitle>
              <EmptyDescription>Sé el primero en publicar algo que hayas encontrado o revisa otras categorías.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        {/* Estado 4: Con Datos */}
        {items.data && items.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.data.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </section>

      {/* 4. Sección Informativa: Cómo funciona Finder */}
      <section className="rounded-3xl border bg-card p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="secondary" className="px-3 py-1 text-xs">Paso a Paso</Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">¿Cómo funciona Finder?</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Diseñado para devolver objetos a sus dueños de forma segura y transparente.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-none bg-muted/30">
            <CardHeader>
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Plus className="size-5" />
              </div>
              <CardTitle className="text-base">1. Publica lo que encuentres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Sube la foto y los datos públicos del objeto. Añade también un detalle oculto que solo tú conoces.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-muted/30">
            <CardHeader>
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Lock className="size-5" />
              </div>
              <CardTitle className="text-base">2. Comprueba el detalle</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Quien lo haya perdido lo buscará y responderá cuál es el detalle oculto para demostrar que es suyo.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-none bg-muted/30">
            <CardHeader>
              <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle className="text-base">3. Devolución completada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Acepta la reclamación si coincide la respuesta y poneos en contacto para devolver el objeto.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 5. Sección: Quiénes somos / Sobre Finder */}
      <section className="rounded-3xl border bg-muted/20 p-6 sm:p-10 space-y-6">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5">
              <Users className="size-3.5 text-primary" /> Quiénes somos
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Una comunidad unida por la empatía y la honestidad
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
              Finder nació con una misión clara: conectar a personas que han perdido algo valioso con aquellas que lo han encontrado y desean devolverlo. Creemos que la tecnología debe servir para fortalecer el espíritu colaborativo entre ciudadanos.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1 border-l-2 border-primary pl-4">
                <p className="text-2xl font-extrabold text-foreground">100%</p>
                <p className="text-xs text-muted-foreground">Gratuito y sin comisiones</p>
              </div>
              <div className="space-y-1 border-l-2 border-primary pl-4">
                <p className="text-2xl font-extrabold text-foreground">Privado</p>
                <p className="text-xs text-muted-foreground">Tus datos siempre protegidos</p>
              </div>
            </div>
          </div>

          <Card className="border bg-background p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Heart className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Nuestro Compromiso</h3>
                <p className="text-xs text-muted-foreground">Transparencia y seguridad en cada devolución</p>
              </div>
            </div>
            <Separator />
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              No almacenamos información innecesaria ni vendemos datos a terceros. Toda la experiencia de Finder está pensada para que la devolución sea rápida, honesta y sin fricciones.
            </p>
          </Card>
        </div>
      </section>

      {/* 6. Sección de Reseñas / Carrusel con efecto Hover Zoom */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="secondary" className="px-3 py-1 text-xs gap-1.5">
              <MessageSquareQuote className="size-3.5" /> Historias de Éxito
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Lo que dice nuestra comunidad</h2>
            <p className="text-muted-foreground text-sm">
              Desliza para leer experiencias reales de personas que recuperaron sus pertenencias.
            </p>
          </div>

          {/* Botones de control del Carrusel */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollCarousel('left')}
              aria-label="Anterior reseña"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scrollCarousel('right')}
              aria-label="Siguiente reseña"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Track del Carrusel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-none scroll-smooth"
        >
          {TESTIMONIALS.map((t, idx) => (
            <Card
              key={idx}
              className="w-[300px] sm:w-[350px] shrink-0 snap-start flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-primary/40 cursor-pointer"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {t.item}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed">
                  "{t.comment}"
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. Sección de Preguntas Frecuentes (FAQ) en modo Acordeón desplegable */}
      <section className="rounded-3xl border bg-card p-6 sm:p-10 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5">
            <HelpCircle className="size-3.5 text-primary" /> FAQ
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Preguntas frecuentes</h2>
          <p className="text-muted-foreground text-sm">
            Haz clic en cada pregunta para desplegar la respuesta.
          </p>
        </div>

        <div className="grid gap-3 max-w-3xl mx-auto">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index
            return (
              <Card
                key={index}
                className="border bg-background transition-colors hover:border-primary/40 cursor-pointer overflow-hidden"
                onClick={() => toggleFaq(index)}
              >
                <CardHeader className="p-4 sm:p-5 select-none">
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2.5">
                      <HelpCircle className="size-4 sm:size-5 text-primary shrink-0" />
                      {faq.question}
                    </CardTitle>
                    <div className={`p-1 rounded-md bg-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                {isOpen ? (
                  <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0">
                    <Separator className="mb-3" />
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7">
                      {faq.answer}
                    </p>
                  </CardContent>
                ) : null}
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
