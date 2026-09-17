import { usingMocks } from './index'

// `null` cuando la web usa Firebase: estas herramientas solo existen con datos de ejemplo.
export const mockTools = usingMocks ? await import('./mock/dev-tools') : null
