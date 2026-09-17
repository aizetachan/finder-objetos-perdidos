const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

/** "2026-09-10T17:30:00.000Z" → "10 de septiembre de 2026" */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate))
}
