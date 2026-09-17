// Colección `users`: perfil PÚBLICO de una persona con cuenta.
// El email no está aquí a propósito: es privado y vive solo en la cuenta (ver AuthUser).
export interface User {
  id: string
  displayName: string
  photoURL?: string
  city?: string
  createdAt: string // fecha en formato ISO, p. ej. "2026-09-17T10:00:00.000Z"
}

// La persona que tiene la sesión iniciada. No es una colección: lo da el sistema de cuentas.
export interface AuthUser {
  id: string
  email: string
  displayName: string
  photoURL?: string
}
