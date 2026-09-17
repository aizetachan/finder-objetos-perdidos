import { Hammer } from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { PageHeader } from './page-header'

// Pantalla "en construcción". Quien se encargue de la pantalla sustituye
// este componente por el contenido real.
export function PagePlaceholder({
  title,
  feature,
  todo,
}: {
  title: string
  feature: string
  todo: string
}) {
  return (
    <>
      <PageHeader title={title} />
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Hammer />
          </EmptyMedia>
          <EmptyTitle>Pantalla por construir</EmptyTitle>
          <EmptyDescription>
            {todo}
            <br />
            Carpeta: <code className="font-mono text-xs">features/{feature}/</code>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </>
  )
}
