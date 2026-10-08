import { getCategoryLabel, type Item } from '@finder/shared'
import { ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { paths } from '@/routes/paths'

export function SearchItemCard({ item }: { item: Item }) {
  return (
    <Link
      to={paths.itemDetail(item.id)}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Ver detalles de ${item.title}`}
    >
      <Card className="flex h-full flex-col overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
        <div className="relative h-40 w-full overflow-hidden bg-muted sm:h-auto sm:aspect-4/3">
          <img
            src={item.photos[0]}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <CardHeader className="gap-1.5 p-4 pb-2 sm:gap-2 sm:p-6 sm:pb-3">
          <Badge variant="secondary" className="w-fit text-xs">
            {getCategoryLabel(item.category)}
          </Badge>
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {item.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-xs">
            <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span>{item.city} · {formatDate(item.date)}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col justify-between gap-3 p-4 pt-0 sm:gap-4 sm:p-6 sm:pt-0">
          <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {item.description}
          </p>

          <div className="mt-auto flex items-center gap-1 text-xs font-medium text-primary sm:text-sm">
            <span>Ver detalles</span>
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
