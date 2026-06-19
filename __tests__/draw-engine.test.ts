import { describe, it, expect } from 'vitest'
import { draw } from '@/lib/draw-engine'

describe('draw', () => {
  it('lance une erreur avec moins de 2 participants', () => {
    expect(() => draw(['Alice'])).toThrow('Minimum 2 participants')
    expect(() => draw([])).toThrow('Minimum 2 participants')
  })

  it('lance une erreur si doublons (case-insensitive)', () => {
    expect(() => draw(['Alice', 'alice'])).toThrow('Noms en double détectés')
    expect(() => draw(['Bob', 'Bob', 'Claire'])).toThrow('Noms en double détectés')
  })

  it("retourne autant d'assignations que de participants", () => {
    const result = draw(['Alice', 'Bob', 'Claire'])
    expect(result).toHaveLength(3)
  })

  it('personne ne se tire lui-même', () => {
    for (let i = 0; i < 50; i++) {
      const result = draw(['Alice', 'Bob', 'Claire', 'David'])
      result.forEach(({ giver, receiver }) => {
        expect(giver).not.toBe(receiver)
      })
    }
  })

  it('chaque participant reçoit exactement un cadeau', () => {
    const participants = ['Alice', 'Bob', 'Claire', 'David']
    const result = draw(participants)
    const receivers = result.map(a => a.receiver).sort()
    expect(receivers).toEqual([...participants].sort())
  })

  it('chaque participant donne exactement un cadeau', () => {
    const participants = ['Alice', 'Bob', 'Claire', 'David']
    const result = draw(participants)
    const givers = result.map(a => a.giver).sort()
    expect(givers).toEqual([...participants].sort())
  })

  it('fonctionne avec seulement 2 participants', () => {
    const result = draw(['Alice', 'Bob'])
    expect(result).toHaveLength(2)
    result.forEach(({ giver, receiver }) => {
      expect(giver).not.toBe(receiver)
    })
  })
})
