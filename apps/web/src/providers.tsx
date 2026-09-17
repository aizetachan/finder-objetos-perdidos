import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { queryClient } from '@/lib/query-client'

// Todo lo que la app necesita "alrededor" para funcionar: datos y avisos.
// El modo oscuro está preparado en index.css pero no activado; se decidirá en el rediseño.
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster theme="light" />
    </QueryClientProvider>
  )
}
