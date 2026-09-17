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
        <img
          src={item.photos[0]}
          alt=""
          loading="lazy"
          className="aspect-4/3 w-full bg-muted object-cover"
        />
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            {getCategoryLabel(item.category)}
          </Badge>
          <CardTitle>{item.title}</CardTitle>
          <CardDescription className="flex items-center gap-1">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {item.city} · {formatDate(item.date)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
