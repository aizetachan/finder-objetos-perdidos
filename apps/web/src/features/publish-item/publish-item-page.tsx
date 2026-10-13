import { useState } from 'react'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { cn } from '@/lib/utils'
import { StepLocationDate, type StepLocationDateData } from './step-location-date'
import { StepPhotoAi, type StepPhotoAiData } from './step-photo-ai'
import { StepReviewConfirm } from './step-review-confirm'
import { StepSecurityLogistics, type StepSecurityLogisticsData } from './step-security-logistics'

interface WizardStep {
  number: number
  title: string
}

const WIZARD_STEPS: WizardStep[] = [
  { number: 1, title: '1. Foto' },
  { number: 2, title: '2. Ubicación' },
  { number: 3, title: '3. Seguridad' },
  { number: 4, title: '4. Revisar' },
]

export function PublishItemPage() {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [step1Data, setStep1Data] = useState<StepPhotoAiData | null>(null)
  const [step2Data, setStep2Data] = useState<StepLocationDateData | null>(null)
  const [step3Data, setStep3Data] = useState<StepSecurityLogisticsData | null>(null)
  const [contactEmail, setContactEmail] = useState<string>('')

  function handleStep1Continue(data: StepPhotoAiData) {
    setStep1Data(data)
    setCurrentStep(2)
  }

  function handleStep2Back(currentValues?: Partial<StepLocationDateData>) {
    if (currentValues) {
      setStep2Data((prev) => ({ ...prev, ...currentValues } as StepLocationDateData))
    }
    setCurrentStep(1)
  }

  function handleStep2Continue(data: StepLocationDateData) {
    setStep2Data(data)
    setCurrentStep(3)
  }

  function handleStep3Back(currentValues?: Partial<StepSecurityLogisticsData>) {
    if (currentValues) {
      setStep3Data((prev) => ({ ...prev, ...currentValues } as StepSecurityLogisticsData))
    }
    setCurrentStep(2)
  }

  function handleStep3Continue(data: StepSecurityLogisticsData) {
    setStep3Data(data)
    setCurrentStep(4)
  }

  function handleStep4Back(currentEmail?: string) {
    if (currentEmail) {
      setContactEmail(currentEmail)
    }
    setCurrentStep(3)
  }

  function handleReset() {
    setStep1Data(null)
    setStep2Data(null)
    setStep3Data(null)
    setContactEmail('')
    setCurrentStep(1)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      {/* Cabecera */}
      <PageHeader
        title="Publicar un objeto encontrado"
        description="Registra el objeto en 4 pasos para que su dueño pueda encontrarlo y reclamarlo."
      />

      {/* Stepper con distribución uniforme (Fill container - 4 columnas iguales) */}
      <nav aria-label="Progreso del asistente de publicación" className="w-full">
        <ol className="grid grid-cols-4 gap-2 sm:gap-4">
          {WIZARD_STEPS.map((step) => {
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number

            return (
              <li key={step.number} className="flex min-w-0 flex-col gap-2">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full transition-colors',
                    isActive && 'bg-primary',
                    isCompleted && 'bg-primary/80',
                    !isActive && !isCompleted && 'bg-muted'
                  )}
                />
                <div className="flex min-w-0 items-center gap-1">
                  {isCompleted ? (
                    <Check className="size-3.5 shrink-0 text-primary" />
                  ) : null}
                  <span
                    className={cn(
                      'truncate text-xs sm:text-sm font-medium transition-colors',
                      isActive && 'font-semibold text-foreground',
                      isCompleted && 'text-muted-foreground',
                      !isActive && !isCompleted && 'text-muted-foreground/60'
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Caja del paso activo (100% ancho del contenedor) */}
      <div className="w-full">
        {currentStep === 1 ? (
          <StepPhotoAi
            initialData={step1Data ?? undefined}
            onContinue={handleStep1Continue}
          />
        ) : null}

        {currentStep === 2 ? (
          <StepLocationDate
            initialData={step2Data ?? undefined}
            onBack={handleStep2Back}
            onContinue={handleStep2Continue}
          />
        ) : null}

        {currentStep === 3 ? (
          <StepSecurityLogistics
            initialData={step3Data ?? undefined}
            onBack={handleStep3Back}
            onContinue={handleStep3Continue}
          />
        ) : null}

        {currentStep === 4 ? (
          <StepReviewConfirm
            step1Data={step1Data}
            step2Data={step2Data}
            step3Data={step3Data}
            initialEmail={contactEmail}
            onBack={handleStep4Back}
            onReset={handleReset}
          />
        ) : null}
      </div>
    </div>
  )
}
