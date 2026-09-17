# services/

Aquí vive **todo el acceso a datos**. Las pantallas nunca hablan con Firebase directamente:
usan `services` (`import { services } from '@/services'`).

| Archivo | Qué es |
|---|---|
| `types.ts` | **El contrato**: la lista de todas las operaciones (`getItems`, `createClaim`…). |
| `index.ts` | Elige la implementación: datos de ejemplo (por defecto) o Firebase (`VITE_USE_MOCKS=false`). |
| `mock/` | Implementación con datos de ejemplo guardados en el navegador. Imita también los permisos. |
| `firebase/` | Implementación real contra Firestore y Auth. Escrita, pero desactivada en la fase 1. |
| `query-keys.ts` | Nombres de las consultas para TanStack Query. |
| `dev-tools.ts` | Herramientas que solo existen con datos de ejemplo (cambiar de persona, restaurar). |

## Añadir una operación nueva

1. Decláralo en `types.ts`.
2. Impleméntalo en `mock/index.ts`. Con esto ya puedes seguir trabajando.
3. Impleméntalo en `firebase/index.ts` (o pide ayuda al lead). TypeScript no deja compilar si falta.
4. Si necesitas un tipo de dato nuevo, va en `packages/shared/src/types/`, y sus datos de ejemplo en `packages/shared/src/seed/seed.ts`.
