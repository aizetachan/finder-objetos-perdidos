import { Info, Plus, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

// Colores del tema. Los nombres coinciden con las variables de src/index.css.
const colorTokens = [
  'background',
  'foreground',
  'primary',
  'secondary',
  'muted',
  'accent',
  'destructive',
  'border',
  'card',
] as const

// Las clases van escritas enteras para que Tailwind las detecte.
const colorClasses: Record<(typeof colorTokens)[number], string> = {
  background: 'bg-background',
  foreground: 'bg-foreground',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  muted: 'bg-muted',
  accent: 'bg-accent',
  destructive: 'bg-destructive',
  border: 'bg-border',
  card: 'bg-card',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {children}
      <Separator className="mt-8" />
    </section>
  )
}

// PÁGINA TEMPORAL (ver docs/DECISIONES.md): no es parte del producto. Para quitarla, borrar
// esta carpeta, su ruta en routes/ y el enlace en components/layout/header.tsx.
//
// Referencia visual de todo lo que hay disponible para construir pantallas.
// Si un componente no está aquí, no se inventa: se pide (ver docs/FLUJO-DE-TRABAJO.md).
export function StyleguidePage() {
  return (
    <>
      <PageHeader
        title="Guía de estilos"
        description="Todos los componentes y estilos disponibles. Las pantallas se construyen solo con esto."
      />

      <div className="space-y-8">
        <Section title="Colores">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {colorTokens.map((token) => (
              <div key={token} className="space-y-1.5">
                <div className={`h-14 rounded-lg border ${colorClasses[token]}`} />
                <p className="font-mono text-xs text-muted-foreground">{token}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Tipografía">
          <div className="space-y-2">
            <p className="font-heading text-4xl font-semibold tracking-tight">Título grande</p>
            <p className="font-heading text-2xl font-semibold tracking-tight">Título de pantalla</p>
            <p className="font-heading text-lg font-semibold">Título de sección</p>
            <p>Texto normal para párrafos y descripciones.</p>
            <p className="text-sm text-muted-foreground">Texto secundario, más pequeño y suave.</p>
          </div>
        </Section>

        <Section title="Botones">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Principal</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="outline">Borde</Button>
            <Button variant="ghost">Fantasma</Button>
            <Button variant="destructive">Peligro</Button>
            <Button variant="link">Enlace</Button>
            <Button disabled>Desactivado</Button>
            <Button>
              <Plus data-icon="inline-start" />
              Con icono
            </Button>
          </div>
        </Section>

        <Section title="Etiquetas">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Publicado</Badge>
            <Badge variant="secondary">Reclamado</Badge>
            <Badge variant="outline">Devuelto</Badge>
            <Badge variant="destructive">Rechazado</Badge>
          </div>
        </Section>

        <Section title="Formularios">
          <FieldGroup className="max-w-md">
            <Field>
              <FieldLabel htmlFor="sg-title">Título</FieldLabel>
              <Input id="sg-title" placeholder="Cartera marrón de piel" />
              <FieldDescription>Lo primero que verá quien busca.</FieldDescription>
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="sg-city">Ciudad</FieldLabel>
              <Input id="sg-city" aria-invalid />
              <FieldError>La ciudad es obligatoria.</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="sg-category">Categoría</FieldLabel>
              <Select>
                <SelectTrigger id="sg-category">
                  <SelectValue placeholder="Elige una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electrónica</SelectItem>
                  <SelectItem value="keys">Llaves</SelectItem>
                  <SelectItem value="wallets">Carteras y bolsos</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="sg-description">Descripción</FieldLabel>
              <Textarea id="sg-description" placeholder="Cómo es el objeto…" />
            </Field>
            <Field orientation="horizontal">
              <Checkbox id="sg-terms" />
              <FieldLabel htmlFor="sg-terms">Confirmo que el objeto lo tengo yo</FieldLabel>
            </Field>
          </FieldGroup>
        </Section>

        <Section title="Tarjeta">
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Cartera marrón de piel</CardTitle>
              <CardDescription>Madrid · Parque del Retiro · hace 2 días</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Encontrada en un banco cerca del estanque.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ver ficha
              </Button>
            </CardFooter>
          </Card>
        </Section>

        <Section title="Pestañas">
          <Tabs defaultValue="pending" className="max-w-md">
            <TabsList>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="resolved">Resueltas</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="text-sm text-muted-foreground">
              Reclamaciones que esperan respuesta.
            </TabsContent>
            <TabsContent value="resolved" className="text-sm text-muted-foreground">
              Reclamaciones aceptadas o rechazadas.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Avisos">
          <div className="max-w-xl space-y-3">
            <Alert>
              <Info />
              <AlertTitle>Información</AlertTitle>
              <AlertDescription>Los detalles ocultos solo los ves tú.</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>No se ha podido guardar. Inténtalo de nuevo.</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast.success('Objeto publicado')}>
                Aviso de éxito
              </Button>
              <Button variant="outline" onClick={() => toast.error('Algo ha fallado')}>
                Aviso de error
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Ventana de confirmación">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Abrir ventana</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Aceptar esta reclamación?</DialogTitle>
                <DialogDescription>
                  La otra persona verá tu nombre y tu email para poder quedar contigo.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Aceptar</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section title="Tabla">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Objeto</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Llaves con llavero rojo</TableCell>
                <TableCell>Valencia</TableCell>
                <TableCell>
                  <Badge>Publicado</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gafas de sol</TableCell>
                <TableCell>Sevilla</TableCell>
                <TableCell>
                  <Badge variant="secondary">Reclamado</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Cargando y personas">
          <div className="flex items-center gap-6">
            <div className="w-48 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Avatar>
              <AvatarFallback>LM</AvatarFallback>
            </Avatar>
          </div>
        </Section>
      </div>
    </>
  )
}
