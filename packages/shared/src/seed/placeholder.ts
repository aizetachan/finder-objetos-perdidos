/**
 * Foto de relleno con un texto, para los datos de ejemplo. Es una imagen generada aquí mismo
 * (no depende de internet ni de ningún servicio externo).
 */
export function placeholderPhoto(text: string): string {
  const label = text.length > 16 ? `${text.slice(0, 15)}…` : text
  const safe = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
    '<rect width="800" height="600" fill="#e5e5e5"/>' +
    '<text x="400" y="300" font-family="sans-serif" font-size="64" font-weight="600" fill="#525252" ' +
    `text-anchor="middle" dominant-baseline="middle">${safe}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
