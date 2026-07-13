export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function hasNoLineBreaks(value: string): boolean {
  return !/[\r\n]/.test(value)
}

// Échappe les métacaractères LIKE/ILIKE (%, _, \) avant de les passer à un filtre
// PostgREST ilike — sans ça, un prénom contenant "%" élargit la recherche à des
// lignes qui ne correspondent pas vraiment à ce qui a été saisi.
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, match => `\\${match}`)
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
