import { describe, it, expect } from 'vitest'
import { encodeAssignments, decodeAssignments, findMyReceiver } from '@/lib/encoding'
import type { Assignment } from '@/lib/draw-engine'

const sampleAssignments: Assignment[] = [
  { giver: 'Alice', receiver: 'Bob' },
  { giver: 'Bob', receiver: 'Claire' },
  { giver: 'Claire', receiver: 'Alice' },
]

const assignmentsWithAccents: Assignment[] = [
  { giver: 'Témehau', receiver: 'Hīnatea' },
  { giver: 'Hīnatea', receiver: 'Témehau' },
]

describe('encodeAssignments / decodeAssignments', () => {
  it('encode et decode sans perte', () => {
    const token = encodeAssignments(sampleAssignments)
    const decoded = decodeAssignments(token)
    expect(decoded).toEqual(sampleAssignments)
  })

  it('supporte les caractères accentués (prénoms polynésiens)', () => {
    const token = encodeAssignments(assignmentsWithAccents)
    const decoded = decodeAssignments(token)
    expect(decoded).toEqual(assignmentsWithAccents)
  })

  it('le token est une chaîne non vide sans espace ni +/=', () => {
    const token = encodeAssignments(sampleAssignments)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)
    expect(token).not.toContain(' ')
    expect(token).not.toContain('+')
    expect(token).not.toContain('=')
  })

  it('lance une erreur si token invalide', () => {
    expect(() => decodeAssignments('pas-valide!!')).toThrow('Token invalide')
    expect(() => decodeAssignments('')).toThrow('Token invalide')
  })
})

describe('findMyReceiver', () => {
  it('retourne le destinataire par nom (exact)', () => {
    expect(findMyReceiver(sampleAssignments, 'Alice')).toBe('Bob')
    expect(findMyReceiver(sampleAssignments, 'Bob')).toBe('Claire')
  })

  it('retourne le destinataire (case-insensitive)', () => {
    expect(findMyReceiver(sampleAssignments, 'alice')).toBe('Bob')
    expect(findMyReceiver(sampleAssignments, 'CLAIRE')).toBe('Alice')
  })

  it("retourne null si le nom n'est pas dans le tirage", () => {
    expect(findMyReceiver(sampleAssignments, 'David')).toBeNull()
  })
})
