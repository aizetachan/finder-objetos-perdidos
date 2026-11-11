import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, HeartHandshake, MoreVertical, Send, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { z } from 'zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  CHAT_RESET_EVENT,
  DEMO_CHAT_MESSAGES_KEY,
  markClaimsAsRead,
  resetDemoChatFlow,
} from '@/hooks/use-claims-notification'
import { cn } from '@/lib/utils'
import { paths } from '@/routes/paths'

export interface Message {
  id: string
  sender: 'me' | 'other' | 'system'
  text: string
  timestamp: string
}

export type ChatPhase = 2 | 3 | 4

const PREFILL_CHIPS = [
  { label: '📍 Proponer lugar público', prefill: '📍 Proponer lugar público: ' },
  { label: '🏛️ Dejar en Punto Seguro', prefill: '🏛️ Dejar en Punto Seguro: ' },
  {
    label: '☕ Proponer cafetería de la plaza',
    prefill: '¡Hola! ¿Te viene bien si la dejo en la cafetería de la plaza principal?',
  },
] as const

const messageFormSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'Escribe un mensaje antes de enviarlo')
    .max(500, 'El mensaje no puede superar los 500 caracteres'),
})

type MessageFormValues = z.infer<typeof messageFormSchema>

function formatCurrentTime(): string {
  return new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function buildInitialMessages(): Message[] {
  return [
    {
      id: 'msg-initial-system',
      sender: 'system',
      text: '✅ El detalle de seguridad coincide. Ahora debéis acordar la entrega: Carlos R. prefiere «En mano en lugar público», pero tú indicaste «Dejar en punto seguro». ¿Qué opción preferís?',
      timestamp: '10:12',
    },
    {
      id: 'msg-initial-carlos',
      sender: 'other',
      text: '¡Hola Lucía! Muchísimas gracias por encontrar mi cartera. He visto que prefieres dejarla en un punto seguro para no perder tiempo, ¡por mí perfecto! ¿Qué sitio te viene mejor cerca de donde la encontraste?',
      timestamp: '10:14',
    },
  ]
}

export function ChatRoomPage() {
  const { id } = useParams<{ id: string }>()
  const claimCode = id ?? 'FND-8492'

  return <ChatRoomView key={claimCode} claimCode={claimCode} />
}

function ChatRoomView({ claimCode }: { claimCode: string }) {
  const navigate = useNavigate()

  // Guion coherente de simulación con marcas de tiempo realistas
  const demoScript: Array<{ sender: Message['sender']; text: string; timestamp: string }> = [
    {
      sender: 'me',
      text: '¡Hola! ¿Te viene bien si la dejo en la cafetería de la plaza principal?',
      timestamp: '10:30',
    },
    {
      sender: 'other',
      text: 'Perfecto, me viene genial. Me paso por allí esta tarde.',
      timestamp: '10:35',
    },
    {
      sender: 'me',
      text: 'Genial, la dejaré en la barra a tu nombre sobre las 18:00.',
      timestamp: '10:36',
    },
    {
      sender: 'other',
      text: 'Ya la tengo conmigo. ¡Muchísimas gracias por todo!',
      timestamp: '18:45',
    },
  ]

  // Máquina de estados del chat: 2 = Coordinando, 3 = Encuentro fijado, 4 = Entregado
  const [chatPhase, setChatPhase] = useState<ChatPhase>(2)
  const [messages, setMessages] = useState<Message[]>(() => buildInitialMessages())
  const [demoStep, setDemoStep] = useState(0)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      text: '',
    },
  })

  // Al montar el chat activo, apagamos de inmediato el punto rojo y el badge del Header
  useEffect(() => {
    markClaimsAsRead()
  }, [])

  // Escucha reinicios globales (ej. desde "Restaurar datos de ejemplo" del menú)
  useEffect(() => {
    const handleExternalReset = () => {
      setChatPhase(2)
      setDemoStep(0)
      setMessages(buildInitialMessages())
      form.reset({ text: '' })
      form.clearErrors()
    }
    window.addEventListener(CHAT_RESET_EVENT, handleExternalReset)
    return () => window.removeEventListener(CHAT_RESET_EVENT, handleExternalReset)
  }, [form])

  // Persiste el historial activo en localStorage ante cualquier nuevo mensaje
  useEffect(() => {
    try {
      localStorage.setItem(DEMO_CHAT_MESSAGES_KEY, JSON.stringify(messages))
    } catch {
      // Ignorar si el navegador bloquea la escritura en localStorage
    }
  }, [messages])

  // Desplaza suavemente al último mensaje cada vez que entra uno nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function appendMessage(sender: Message['sender'], text: string, customTimestamp?: string) {
    const cleanText = text.trim()
    if (!cleanText) return

    const nextMessage: Message = {
      id: createMessageId(),
      sender,
      text: cleanText,
      timestamp: customTimestamp ?? formatCurrentTime(),
    }

    setMessages((prev) => [...prev, nextMessage])
  }

  function handleSendSubmit(values: MessageFormValues) {
    if (chatPhase === 4) return
    appendMessage('me', values.text)
    form.reset({ text: '' })
    form.clearErrors()
  }

  // Pre-rellena el campo de texto inferior sin enviar todavía para que el usuario pueda completarlo
  function handleQuickChipClick(prefillText: string) {
    form.setValue('text', prefillText, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    })
    form.setFocus('text')
  }

  function handleSimulateConversation() {
    const currentIndex = demoStep
    const nextItem = demoScript[currentIndex]
    if (!nextItem) return
    appendMessage(nextItem.sender, nextItem.text, nextItem.timestamp)
    if (currentIndex === 2) {
      setChatPhase(3)
    }
    setDemoStep((prev) => prev + 1)
  }

  function handleResetChat() {
    resetDemoChatFlow()
    toast.success('Chat y notificaciones de demostración reiniciados')
  }

  function handleConfirmScheduleMeetup() {
    markClaimsAsRead()
    setChatPhase(3)
    setIsScheduleDialogOpen(false)
    appendMessage(
      'system',
      '🤝 Encuentro fijado. El chat sigue disponible por si necesitáis avisaros el día de la entrega.',
    )
    toast.success('Encuentro fijado. Estado actualizado a la fase 3.')
  }

  function handleConfirmCancelDelivery() {
    markClaimsAsRead()
    try {
      localStorage.removeItem(DEMO_CHAT_MESSAGES_KEY)
    } catch {
      // Ignorar si el navegador bloquea localStorage
    }
    setIsCancelDialogOpen(false)
    toast.info('Entrega cancelada. El objeto vuelve a estar activo en el catálogo público.')
    navigate(paths.myItems)
  }

  function handleConfirmReportUser() {
    markClaimsAsRead()
    try {
      localStorage.removeItem(DEMO_CHAT_MESSAGES_KEY)
    } catch {
      // Ignorar si el navegador bloquea localStorage
    }
    setIsReportDialogOpen(false)
    toast.success('Reporte enviado. Hemos bloqueado el contacto con este usuario.')
    navigate(paths.myItems)
  }

  function handleConfirmDelivery() {
    markClaimsAsRead()
    setChatPhase(4)
    setIsDeliverDialogOpen(false)
    appendMessage('system', 'El objeto ha sido entregado con éxito. Misión cumplida.')
    toast.success('¡Entrega confirmada! Gracias por tu acción altruista.')
  }

  const isDemoFinished = demoStep >= demoScript.length

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh-3.5rem)] max-h-[100dvh] flex-col bg-background text-foreground sm:mx-auto sm:-my-4 sm:h-[calc(100dvh-5.5rem)] sm:max-w-3xl sm:rounded-xl sm:border sm:shadow-sm">
      {/* Sub-cabecera pegajosa del Chat debajo del Header principal */}
      <header className="sticky top-14 z-10 shrink-0 border-b bg-background shadow-sm sm:rounded-t-xl">
        <div className="space-y-2.5 px-3 py-2.5 sm:px-5 sm:py-3">
          {/* Fila 1: Botón volver, Avatar, nombre verificado y menú de escape a la derecha */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="-ml-1 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Link to={paths.claimReview(claimCode)} aria-label="Volver a la reclamación">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>

              <Avatar className="shrink-0">
                <AvatarFallback aria-hidden>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-heading text-sm font-bold text-foreground sm:text-base">
                  Carlos R. (Persona verificada)
                </h1>
                <p className="truncate text-xs text-muted-foreground">
                  Cartera negra · ID: #{claimCode}
                </p>
              </div>
            </div>

            {/* Menú de opciones secundarias (Escape / Cancelación) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="-mr-1 shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Opciones de la conversación"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuItem
                  variant="destructive"
                  className="text-destructive"
                  onSelect={() => setIsCancelDialogOpen(true)}
                >
                  🚫 Cancelar entrega y reactivar
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="text-destructive"
                  onSelect={() => setIsReportDialogOpen(true)}
                >
                  ⚠️ Denunciar comportamiento sospechoso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Fila 2: Stepper sincronizado con chatPhase (2 | 3 | 4) */}
          <nav
            aria-label="Progreso de la entrega"
            className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-xs"
          >
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              1. Verificado ✓
            </span>
            <span className="text-muted-foreground/60" aria-hidden>
              ➔
            </span>
            <span
              className={cn(
                chatPhase > 2
                  ? 'font-medium text-emerald-700 dark:text-emerald-400'
                  : 'rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
              )}
            >
              {chatPhase > 2 ? '2. Coordinando ✓' : '2. Coordinando ●'}
            </span>
            <span className="text-muted-foreground/60" aria-hidden>
              ➔
            </span>
            <span
              className={cn(
                chatPhase === 4 && 'font-medium text-emerald-700 dark:text-emerald-400',
                chatPhase === 3 &&
                  'rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
                chatPhase < 3 && 'text-muted-foreground',
              )}
            >
              {chatPhase === 4
                ? '3. Encuentro fijado ✓'
                : chatPhase === 3
                  ? '3. Encuentro fijado ●'
                  : '3. Encuentro fijado ○'}
            </span>
            <span className="text-muted-foreground/60" aria-hidden>
              ➔
            </span>
            <span
              className={cn(
                chatPhase === 4
                  ? 'rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'text-muted-foreground',
              )}
            >
              {chatPhase === 4 ? '4. Entregado ✓' : '4. Entregado ○'}
            </span>
          </nav>

          {/* Fila 3: Aviso de Privacidad (Zero-Exposure) */}
          <Alert className="border-blue-200 bg-blue-50 px-3 py-2 text-blue-900 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-200">
            <AlertDescription className="text-xs leading-snug text-blue-900 dark:text-blue-200">
              🛡️ Seguridad Finder: No compartas tu teléfono, dirección privada ni datos bancarios.
              Acordad siempre la entrega en un lugar público concurrido o punto oficial.
            </AlertDescription>
          </Alert>
        </div>
      </header>

      {/* Sala de mensajes con contraste diferenciado por remitente */}
      <div
        aria-label="Mensajes del chat seguro"
        className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-muted/30"
      >
        <div className="flex w-full flex-col gap-3 px-3 py-4 sm:px-5">
          {messages.map((message) => {
            if (message.sender === 'system') {
              return (
                <p
                  key={message.id}
                  className="mx-auto my-2 max-w-xl bg-transparent px-3 text-center text-xs leading-relaxed text-muted-foreground"
                >
                  {message.text}
                </p>
              )
            }

            return (
              <div
                key={message.id}
                className={cn(
                  'flex max-w-[85%] flex-col gap-1 sm:max-w-[75%]',
                  message.sender === 'me' ? 'self-end items-end' : 'self-start items-start',
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                    message.sender === 'me'
                      ? 'rounded-tr-none bg-slate-900 text-white'
                      : 'rounded-tl-none border border-gray-200 bg-gray-100 text-gray-900',
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                </div>
                <span className="px-1 text-[11px] text-muted-foreground">
                  {message.sender === 'me' ? 'Tú' : 'Carlos R.'} · {message.timestamp}
                </span>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Zona inferior fija dinámica según chatPhase */}
      <footer className="sticky bottom-0 z-10 shrink-0 border-t bg-background sm:rounded-b-xl">
        {chatPhase === 4 ? (
          /* Fase 4: Cierre altruista de solo lectura con gamificación */
          <div className="space-y-2.5 bg-muted/30 px-3 py-3.5 sm:rounded-b-xl sm:px-5 sm:py-4">
            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3.5 py-3 text-yellow-800 shadow-2xs dark:border-yellow-800/60 dark:bg-yellow-950/40 dark:text-yellow-200">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                <HeartHandshake className="size-5" aria-hidden />
              </div>
              <div className="space-y-0.5 text-left">
                <p className="text-xs font-semibold sm:text-sm">
                  🎉 ¡Misión cumplida! El objeto ha vuelto a su dueño.
                </p>
                <p className="text-xs font-medium sm:text-sm">
                  🎁 Has recibido +50 Puntos Finder por tu acción altruista.
                </p>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              🔒 Este chat se ha cerrado porque el objeto ha vuelto a su dueño. ¡Gracias por tu
              acción altruista!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 px-3 pt-2.5 pb-2.5 sm:px-5 sm:pt-3 sm:pb-3">
            {/* Banner consistente con la paleta verde de la marca (Fases 2 y 3) */}
            <Alert className="border-emerald-200 bg-emerald-50 px-3 py-2.5 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <AlertDescription className="text-xs font-medium leading-snug text-emerald-900 sm:text-sm dark:text-emerald-200">
                  {chatPhase === 2
                    ? 'Cuando hayáis acordado un lugar y hora definitivos, confirma el paso.'
                    : 'Encuentro fijado. Cuando entregues físicamente el objeto, confírmalo aquí.'}
                </AlertDescription>

                {chatPhase === 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleDialogOpen(true)}
                    className="w-full shrink-0 border-emerald-600 bg-white/80 text-emerald-700 shadow-2xs hover:bg-emerald-100 hover:text-emerald-800 sm:w-auto dark:border-emerald-500 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                  >
                    🤝 Marcar encuentro fijado
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsDeliverDialogOpen(true)}
                    className="w-full shrink-0 bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 sm:w-auto"
                  >
                    ✅ Confirmar entrega física
                  </Button>
                )}
              </div>
            </Alert>

            {/* Píldoras conversacionales puras (solo en Fase 2) */}
            {chatPhase === 2 ? (
              <div
                role="group"
                aria-label="Respuestas rápidas de conversación"
                className="flex items-center gap-2 overflow-x-auto pb-0.5 whitespace-nowrap"
              >
                {PREFILL_CHIPS.map((chip) => (
                  <Button
                    key={chip.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickChipClick(chip.prefill)}
                    className="shrink-0 rounded-full border-primary/25 bg-muted/70 text-xs font-medium text-foreground shadow-xs hover:border-primary/40 hover:bg-accent"
                  >
                    {chip.label}
                  </Button>
                ))}
              </div>
            ) : null}

            {/* Caja de escritura habilitada tanto en Fase 2 como en Fase 3 */}
            <form onSubmit={form.handleSubmit(handleSendSubmit)} noValidate>
              <Field data-invalid={Boolean(form.formState.errors.text)}>
                <FieldLabel htmlFor="chat-message-input" className="sr-only">
                  Mensaje seguro
                </FieldLabel>
                <div className="flex items-center gap-2">
                  <Input
                    id="chat-message-input"
                    autoComplete="off"
                    placeholder="Escribe un mensaje seguro (sin datos personales)..."
                    aria-invalid={Boolean(form.formState.errors.text)}
                    className="flex-1 shadow-xs"
                    {...form.register('text')}
                  />
                  <Button type="submit" className="shrink-0 shadow-xs">
                    <Send data-icon="inline-start" className="size-3.5" />
                    Enviar
                  </Button>
                </div>
                {form.formState.errors.text ? (
                  <FieldError className="text-xs">{form.formState.errors.text.message}</FieldError>
                ) : null}
              </Field>
            </form>

            {/* Controles de simulación y reinicio del MVP */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDemoFinished}
                onClick={handleSimulateConversation}
                className="border-dashed text-xs"
              >
                {isDemoFinished ? '[Demo] Conversación finalizada' : '[Demo] Simular conversación'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetChat}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                🔄 Reiniciar chat
              </Button>
            </div>
          </div>
        )}
      </footer>

      {/* Diálogo Fase 2 -> Fase 3: Confirmación de lugar y hora */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmación de lugar y hora</DialogTitle>
            <DialogDescription>
              Confirma este paso cuando hayáis acordado un lugar y hora definitivos. Esto
              actualizará el estado de la reclamación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Volver al chat
              </Button>
            </DialogClose>
            <Button type="button" variant="default" onClick={handleConfirmScheduleMeetup}>
              Sí, encuentro fijado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de escape: Cancelar entrega y reactivar objeto */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Cancelar esta entrega?</DialogTitle>
            <DialogDescription>
              Si hubo una confusión y no vas a entregar el objeto, este volverá al catálogo público
              para que el verdadero dueño lo encuentre.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Volver al chat
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmCancelDelivery}
            >
              Sí, cancelar y reactivar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de seguridad: Denunciar comportamiento sospechoso */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Denunciar a este usuario</DialogTitle>
            <DialogDescription>
              ¿Has notado un comportamiento fraudulento, ofensivo o sospechoso? Nuestro equipo de
              seguridad revisará esta conversación. El usuario será bloqueado temporalmente y no
              sabrá que le has denunciado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Volver
              </Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmReportUser}>
              Enviar reporte y bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Fase 3 -> Fase 4: Confirmación de la entrega */}
      <Dialog open={isDeliverDialogOpen} onOpenChange={setIsDeliverDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmación de la entrega</DialogTitle>
            <DialogDescription>
              Al confirmar, el sistema registrará que has entregado el objeto y se cerrará el chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Volver al chat
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="default"
              onClick={handleConfirmDelivery}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Sí, objeto entregado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
