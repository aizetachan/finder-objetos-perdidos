import { useCallback, useState } from 'react'
import type { StepLocationDateData } from './step-location-date'
import type { StepPhotoAiData } from './step-photo-ai'
import type { StepSecurityLogisticsData } from './step-security-logistics'

export interface PublishDraft {
  currentStep: number
  step1Data: StepPhotoAiData | null
  step2Data: StepLocationDateData | null
  step3Data: StepSecurityLogisticsData | null
  contactEmail: string
}

const STORAGE_KEY = 'finder_publish_draft'

export function getStoredDraft(): PublishDraft | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PublishDraft
  } catch {
    return null
  }
}

export function saveStoredDraft(draft: PublishDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Si la sesión no permite almacenamiento, no bloquea
  }
}

export function clearStoredDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignorar
  }
}

export function usePublishDraft() {
  const [draft, setDraftState] = useState<PublishDraft>(() => {
    const saved = getStoredDraft()
    return (
      saved ?? {
        currentStep: 1,
        step1Data: null,
        step2Data: null,
        step3Data: null,
        contactEmail: '',
      }
    )
  })

  const updateDraft = useCallback((updater: Partial<PublishDraft> | ((prev: PublishDraft) => PublishDraft)) => {
    setDraftState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveStoredDraft(next)
      return next
    })
  }, [])

  const resetDraft = useCallback(() => {
    clearStoredDraft()
    setDraftState({
      currentStep: 1,
      step1Data: null,
      step2Data: null,
      step3Data: null,
      contactEmail: '',
    })
  }, [])

  return {
    draft,
    updateDraft,
    resetDraft,
  }
}
