import type {
  AuthUser,
  Claim,
  ClaimStatus,
  Item,
  ItemFilters,
  NewClaimInput,
  NewItemInput,
  User,
} from '@finder/shared'

// EL CONTRATO: todas las operaciones de datos que existen en la web.
// Hay dos implementaciones que lo cumplen: ./mock (datos de ejemplo) y ./firebase (datos reales).
// Para añadir una operación nueva: 1) añádela aquí, 2) en ./mock, 3) en ./firebase.
export interface Services {
  // — Cuenta —
  getCurrentUser(): AuthUser | null
  /** Avisa cada vez que alguien entra o sale. Devuelve una función para dejar de escuchar. */
  onAuthChange(listener: (user: AuthUser | null) => void): () => void
  signIn(email: string, password: string): Promise<AuthUser>
  signUp(input: { email: string; password: string; displayName: string }): Promise<AuthUser>
  signOut(): Promise<void>

  // — Personas —
  getUser(id: string): Promise<User | null>

  // — Objetos —
  getItems(filters?: ItemFilters): Promise<Item[]>
  getItem(id: string): Promise<Item | null>
  getMyItems(): Promise<Item[]>
  createItem(input: NewItemInput): Promise<Item>
  /** Solo funciona para quien publicó el objeto. */
  getItemHiddenDetails(itemId: string): Promise<string>
  markItemReturned(itemId: string): Promise<void>

  // — Reclamaciones —
  createClaim(input: NewClaimInput): Promise<Claim>
  getMyClaims(): Promise<Claim[]>
  getClaimsOnMyItems(): Promise<Claim[]>
  resolveClaim(claimId: string, status: Exclude<ClaimStatus, 'pending'>): Promise<void>
}

// Error con un mensaje pensado para enseñárselo a la persona tal cual.
export class ServiceError extends Error {
  code: 'not-found' | 'not-signed-in' | 'not-allowed' | 'invalid'

  constructor(code: ServiceError['code'], message: string) {
    super(message)
    this.name = 'ServiceError'
    this.code = code
  }
}
