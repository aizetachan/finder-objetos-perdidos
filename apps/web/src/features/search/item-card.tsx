import { getCategoryLabel, type Item } from '@finder/shared'
import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { paths } from '@/routes/paths'

export function ItemCard({ item }: { item: Item }) {
  return (
    <Link to={paths.itemDetail(item.id)} className="group rounded-xl outline-none">
      <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          <img
            src={item.photos[0]}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge variant="secondary" className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm">
            {getCategoryLabel(item.category)}
          </Badge>
        </div>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="line-clamp-1 text-base font-semibold">{item.title}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-xs">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {item.city} · {formatDate(item.date)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
