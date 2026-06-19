export type Assignment = {
  giver: string
  receiver: string
}

function shuffleFisherYates(arr: string[]): string[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function isDerangement(original: string[], shuffled: string[]): boolean {
  return original.every((name, i) => name !== shuffled[i])
}

export function draw(participants: string[]): Assignment[] {
  if (participants.length < 2) {
    throw new Error('Minimum 2 participants')
  }

  const normalized = participants.map(p => p.toLowerCase())
  const unique = new Set(normalized)
  if (unique.size !== participants.length) {
    throw new Error('Noms en double détectés')
  }

  let shuffled: string[]
  let attempts = 0
  do {
    shuffled = shuffleFisherYates(participants)
    attempts++
    if (attempts > 1000) throw new Error('Impossible de générer un tirage valide')
  } while (!isDerangement(participants, shuffled))

  return participants.map((giver, i) => ({
    giver,
    receiver: shuffled[i],
  }))
}
