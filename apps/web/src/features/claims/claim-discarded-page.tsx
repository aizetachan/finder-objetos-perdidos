import { RefreshCcw } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { paths } from '@/routes/paths'

export function ClaimDiscardedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md text-center shadow-sm">
        <CardHeader className="items-center space-y-3 pt-2">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <RefreshCcw className="size-7" aria-hidden />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
            Reclamación descartada
          </CardTitle>
        </CardHeader>

        <CardContent>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            Has cancelado la solicitud. El objeto #FND-8492 vuelve a estar activo y visible en el
            catálogo público para que su verdadero dueño pueda encontrarlo.
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Button asChild size="lg" className="w-full">
            <Link to={paths.myItems}>Ir a Mis publicaciones</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

