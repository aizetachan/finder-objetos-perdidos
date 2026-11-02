// Lista corta de contraseñas demasiado frecuentes o fáciles de adivinar.
export const COMMON_PASSWORDS = new Set([
  '12345678',
  '123456789',
  '1234567890',
  'password',
  'password1',
  'password123',
  'qwertyui',
  'qwertyuiop',
  'finder123',
  'contraseña',
  'contrasena',
  'admin123',
  '11111111',
  '00000000',
  'iloveyou',
  'welcome1',
  'testing123',
])

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase().trim())
}
