import { ArrowLeft, Clock, Mail, RotateCw } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { DemoHint } from '@/components/demo-hint'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { paths } from '@/routes/paths'
import { services } from '@/services'
import { useResendVerificationEmail } from './use-resend-verification-email'

export function VerifyEmailPendingPage() {
  const location = useLocation()
  const email =
    (location.state as { email?: string } | null)?.email ??
    services.getCurrentUser()?.email ??
    'tu correo electrónico'

  const { countdown, isResending, resend } = useResendVerificationEmail()

  const handleResend = () => {
    void resend()
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-8">
      <div className="w-full space-y-6">
        <Card className="w-full text-center">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Revisa tu email</CardTitle>
            <CardDescription className="text-base text-muted-foreground pt-1">
              Te hemos enviado un enlace a <span className="font-semibold text-foreground">{email}</span> para activar tu cuenta. Puede tardar un par de minutos; mira también en spam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
              >
                {countdown > 0 ? (
                  <>
                    <Clock className="mr-2 size-4" />
                    Reenviar en {countdown} s
                  </>
                ) : (
                  <>
                    <RotateCw className="mr-2 size-4" />
                    Reenviar email
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <Link
                  to={paths.register}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  ¿Te equivocaste de email? Volver al registro
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <DemoHint className="pt-2" />
      </div>
    </div>
  )
}
