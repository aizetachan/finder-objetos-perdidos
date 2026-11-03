import { FlaskConical } from 'lucide-react'
import { usingMocks } from '@/services'

interface DemoHintProps {
  className?: string
}

export function DemoHint({ className }: DemoHintProps) {
  if (!usingMocks) return null

  return (
    <p
      className={`flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground ${
        className ?? ''
      }`}
    >
      <FlaskConical className="size-3.5 shrink-0" aria-hidden />
      <span>Modo demostración: usa «Simular casos» en el menú de cuenta.</span>
    </p>
  )
}
