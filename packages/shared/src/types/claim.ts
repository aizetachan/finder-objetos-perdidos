export type ClaimStatus = 'pending' | 'accepted' | 'rejected'

export interface Contact {
  name: string
  email: string
}

// Colección `claims`: alguien dice "este objeto es mío".
// Solo la pueden leer las dos partes: quien reclama y quien publicó el objeto.
export interface Claim {
  id: string
  itemId: string
  itemTitle: string
  itemOwnerId: string // quien publicó el objeto
  claimantId: string // quien reclama
  // Quien reclama comparte su contacto desde el principio con quien publicó.
  claimantContact: Contact
  // Quien publicó solo comparte el suyo cuando ACEPTA la reclamación.
  ownerContact?: Contact
  proof: string // el detalle que demuestra que el objeto es suyo
  status: ClaimStatus
  createdAt: string
  resolvedAt?: string
}

export interface NewClaimInput {
  itemId: string
  proof: string
}
