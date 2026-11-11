import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ServiceError, services } from '@/services'

/**
 * Hook para gestionar el reenvío del correo de verificación con un tiempo de espera de 60 segundos.
 */
export function useResendVerificationEmail() {
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const resend = async () => {
    if (countdown > 0 || isResending) return
    setIsResending(true)
    try {
      await services.sendEmailVerification()
      toast.success('Email reenviado', {
        description: 'Hemos vuelto a enviar el enlace de activación a tu correo.',
      })
      setCountdown(60)
    } catch (err) {
      if (err instanceof ServiceError) {
        toast.error(err.message)
      } else {
        toast.error('No se pudo reenviar el email de verificación.')
      }
    } finally {
      setIsResending(false)
    }
  }

  return { countdown, isResending, resend }
}
