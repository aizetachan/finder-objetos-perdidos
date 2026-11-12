import { z } from 'zod'
import { isCommonPassword } from './common-passwords'

/**
 * Esquema de validación de contraseñas compartido entre registro y completar cuenta:
 * - Mínimo 8 caracteres, máximo 128.
 * - Validación contra lista negra de contraseñas comunes.
 * - Sin reglas forzadas de símbolos ni mayúsculas/minúsculas para no perjudicar la usabilidad.
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(128, 'La contraseña no puede superar los 128 caracteres.')
  .refine((val) => !isCommonPassword(val), {
    message: 'Esta contraseña es demasiado común. Prueba con una frase que recuerdes.',
  })
