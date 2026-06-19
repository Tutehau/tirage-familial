import type { Assignment } from '@/lib/draw-engine'

export function encodeAssignments(assignments: Assignment[]): string {
  const json = JSON.stringify(assignments)
  // UTF-8 safe encoding pour les prénoms avec accents (polynésiens, etc.)
  const bytes = new TextEncoder().encode(json)
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function decodeAssignments(token: string): Assignment[] {
  try {
    if (!token) throw new Error()
    // Restaurer le base64 standard depuis le format URL-safe
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) throw new Error()
    return parsed as Assignment[]
  } catch {
    throw new Error('Token invalide')
  }
}

export function findMyReceiver(assignments: Assignment[], myName: string): string | null {
  const match = assignments.find(
    a => a.giver.toLowerCase() === myName.toLowerCase()
  )
  return match ? match.receiver : null
}
