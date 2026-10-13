import { CATEGORIES, type CategoryId, placeholderPhoto } from '@finder/shared'
import { ArrowRight, Loader2, RefreshCw, Sparkles, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import sampleKeysPhoto from './sample-keys.jpg'

export interface StepPhotoAiData {
  photoUrl: string
  title: string
  category: CategoryId
  description: string
}

interface StepPhotoAiProps {
  initialData?: Partial<StepPhotoAiData>
  onContinue?: (data: StepPhotoAiData) => void
}

interface SampleScenario {
  id: string
  label: string
  photoUrl: string
  title: string
  category: CategoryId
  description: string
}

const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    id: 'headphones',
    label: '🎧 Auriculares',
    photoUrl:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    title: 'Auriculares inalámbricos en estuche',
    category: 'electronics',
    description: 'Encontrados en un banco, estuche negro con ligeras marcas de uso.',
  },
  {
    id: 'keys',
    label: '🔑 Llavero',
    photoUrl: sampleKeysPhoto,
    title: 'Llavero con 3 llaves y anilla metálica',
    category: 'keys',
    description: 'Juego de llaves con anilla metálica y llavero de cuero con candado.',
  },
  {
    id: 'wallet',
    label: '👛 Cartera',
    photoUrl:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    title: 'Cartera de mano de piel negra',
    category: 'wallets-bags',
    description: 'Cartera de mano de cuero oscuro con cremallera, bien cuidada.',
  },
]

export function StepPhotoAi({ initialData, onContinue }: StepPhotoAiProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photoUrl ?? null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasData, setHasData] = useState(Boolean(initialData?.photoUrl && initialData?.title))

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [category, setCategory] = useState<CategoryId | ''>(initialData?.category ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')

  function simulateScenarioDetection(scenario: SampleScenario) {
    setIsAnalyzing(true)
    setHasData(false)

    setTimeout(() => {
      setPhotoUrl(scenario.photoUrl)
      setTitle(scenario.title)
      setCategory(scenario.category)
      setDescription(scenario.description)
      setIsAnalyzing(false)
      setHasData(true)
    }, 1200)
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setIsAnalyzing(true)
    setHasData(false)

    setTimeout(() => {
      setPhotoUrl(localUrl)
      const rawName = file.name.replace(/\.[^/.]+$/, '').trim()
      const cleanTitle =
        rawName.length > 2
          ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
          : 'Objeto detectado en fotografía'
      setTitle(cleanTitle)
      setCategory('other')
      setDescription(
        'Objeto identificado a partir de la fotografía cargada. Revisa los detalles para asegurar la precisión.'
      )
      setIsAnalyzing(false)
      setHasData(true)
    }, 1200)
  }

  function handleReset() {
    setPhotoUrl(null)
    setHasData(false)
    setTitle('')
    setCategory('')
    setDescription('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleSubmit() {
    if (!photoUrl || !title.trim() || !category) return
    onContinue?.({
      photoUrl,
      title: title.trim(),
      category,
      description: description.trim(),
    })
  }

  const isComplete =
    hasData && !isAnalyzing && Boolean(photoUrl) && title.trim().length > 0 && category !== ''

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Fotos y descripción del hallazgo</CardTitle>
          {hasData && !isAnalyzing ? (
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="size-3 text-primary" />
              Detección IA completada
            </Badge>
          ) : null}
        </div>
        <CardDescription>
          Sube fotografías claras del objeto para que su dueño pueda reconocerlo fácilmente.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Zona de subida de imagen */}
        {!photoUrl && !isAnalyzing ? (
          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }
              }}
              className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:border-ring focus-visible:outline-hidden"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:scale-105">
                <Upload className="size-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Arrastra tus fotos aquí o haz clic para seleccionarlas
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos admitidos: JPG, PNG o WEBP (máx. 10 MB). Te recomendamos subir al menos 2 fotos (frontal y detalle general).
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="size-3.5" />
                Subir fotos del objeto
              </Button>
            </div>

            {/* Píldoras de escenarios de prueba rápida */}
            <div className="flex flex-col items-center gap-2 pt-2 text-center">
              <span className="text-xs text-muted-foreground">
                O prueba con un escenario de ejemplo:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {SAMPLE_SCENARIOS.map((scenario) => (
                  <Button
                    key={scenario.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => simulateScenarioDetection(scenario)}
                    className="h-8 rounded-full px-3 text-xs gap-1.5 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {scenario.label}
                  </Button>
                ))}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : null}

        {/* Estado breve de análisis con IA */}
        {isAnalyzing ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-8 text-center">
              <div className="relative flex items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <Sparkles className="absolute size-4 text-primary animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Analizando imagen con IA...
                </p>
                <p className="text-xs text-muted-foreground">
                  Extrayendo características, reconociendo el objeto y generando descripción sugerida.
                </p>
              </div>
            </div>

            {/* Skeletons sutiles simulando la carga de campos */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Visualización de foto cargada y campos completados */}
        {hasData && !isAnalyzing && photoUrl ? (
          <div className="space-y-6">
            {/* Previsualización de la foto */}
            <div className="relative overflow-hidden rounded-xl border bg-muted/30">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                <div className="relative size-32 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={photoUrl}
                    alt="Foto del objeto encontrado"
                    onError={(e) => {
                      e.currentTarget.src = placeholderPhoto(title || 'Objeto')
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
                      <Sparkles className="size-3" />
                      Reconocido con IA
                    </Badge>
                    <span className="text-xs text-muted-foreground">Imagen lista para publicar</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Los campos inferiores han sido autocompletados a partir de los atributos detectados.
                    Puedes ajustar cualquier dato si lo consideras necesario.
                  </p>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="gap-1.5"
                    >
                      <RefreshCw className="size-3.5" />
                      Cambiar foto
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Campos del formulario completados y editables */}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="item-title">Título</FieldLabel>
                <Input
                  id="item-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Cartera marrón de piel"
                />
                <FieldDescription>
                  Nombre reconocible para que el dueño identifique el objeto en las búsquedas.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="item-category">Categoría</FieldLabel>
                <Select
                  value={category}
                  onValueChange={(val) => setCategory(val as CategoryId)}
                >
                  <SelectTrigger id="item-category">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Permite filtrar el objeto en los resultados por categoría.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="item-description">Descripción pública</FieldLabel>
                <Textarea
                  id="item-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe el objeto y su estado visible..."
                />
                <FieldDescription>
                  Visible para cualquier persona. No incluyas detalles secretos de comprobación aquí.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full sm:w-auto gap-2"
        >
          Continuar a Ubicación
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
