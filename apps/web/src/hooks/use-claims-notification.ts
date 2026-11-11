import { useEffect, useState } from 'react'

export const DEMO_HAS_READ_KEY = 'finder:demo:has-read'
export const DEMO_CHAT_MESSAGES_KEY = 'finder:demo:chat-messages'
const CLAIMS_NOTIFICATION_EVENT = 'finder:claims-notification-change'
export const CHAT_RESET_EVENT = 'finder:demo-chat-reset'

export function getPendingClaimsCount(): number {
  try {
    return localStorage.getItem(DEMO_HAS_READ_KEY) === 'true' ? 0 : 1
  } catch {
    return 1
  }
}

export function markClaimsAsRead(): void {
  try {
    localStorage.setItem(DEMO_HAS_READ_KEY, 'true')
  } catch {
    // Ignorar si el almacenamiento local no está disponible
  }
  window.dispatchEvent(new Event(CLAIMS_NOTIFICATION_EVENT))
}

export function resetDemoChatFlow(): void {
  try {
    localStorage.removeItem(DEMO_HAS_READ_KEY)
    localStorage.removeItem(DEMO_CHAT_MESSAGES_KEY)
    localStorage.removeItem('finder:has-read-claims')
    // Limpia cualquier clave previa del prototipo
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('finder:chat-mvp:')) {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // Ignorar si el almacenamiento local no está disponible
  }
  window.dispatchEvent(new Event(CLAIMS_NOTIFICATION_EVENT))
  window.dispatchEvent(new Event(CHAT_RESET_EVENT))
}

export function usePendingClaims(): number {
  const [pendingClaims, setPendingClaims] = useState<number>(() => getPendingClaimsCount())

  useEffect(() => {
    const syncState = () => setPendingClaims(getPendingClaimsCount())

    window.addEventListener(CLAIMS_NOTIFICATION_EVENT, syncState)
    window.addEventListener('storage', syncState)

    return () => {
      window.removeEventListener(CLAIMS_NOTIFICATION_EVENT, syncState)
      window.removeEventListener('storage', syncState)
    }
  }, [])

  return pendingClaims
}

export function useDemoChatResetVersion(): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const handleReset = () => setVersion((prev) => prev + 1)
    window.addEventListener(CHAT_RESET_EVENT, handleReset)
    return () => window.removeEventListener(CHAT_RESET_EVENT, handleReset)
  }, [])

  return version
}
