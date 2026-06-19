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

function hasExcludedPair(
  participants: string[],
  shuffled: string[],
  excludePairs: Assignment[]
): boolean {
  return participants.some((giver, i) => {
    const receiver = shuffled[i]
    return excludePairs.some(
      p =>
        p.giver.toLowerCase() === giver.toLowerCase() &&
        p.receiver.toLowerCase() === receiver.toLowerCase()
    )
  })
}

export type DrawOptions = {
  excludePairs?: Assignment[]
}

export function draw(participants: string[], options: DrawOptions = {}): Assignment[] {
  if (participants.length < 2) {
    throw new Error('Minimum 2 participants')
  }

  const normalized = participants.map(p => p.toLowerCase())
  const unique = new Set(normalized)
  if (unique.size !== participants.length) {
    throw new Error('Noms en double détectés')
  }

  const excludePairs = options.excludePairs ?? []

  let shuffled: string[]
  let attempts = 0
  do {
    shuffled = shuffleFisherYates(participants)
    attempts++
    if (attempts > 1000) {
      // Trop de contraintes — tirage sans contrainte historique
      shuffled = shuffleFisherYates(participants)
      let fallback = 0
      while (!isDerangement(participants, shuffled) && fallback < 1000) {
        shuffled = shuffleFisherYates(participants)
        fallback++
      }
      if (!isDerangement(participants, shuffled)) {
        throw new Error('Impossible de générer un tirage valide')
      }
      return participants.map((giver, i) => ({
        giver,
        receiver: shuffled[i],
        repeated: true,
      } as Assignment & { repeated?: boolean }))
    }
  } while (
    !isDerangement(participants, shuffled) ||
    (excludePairs.length > 0 && hasExcludedPair(participants, shuffled, excludePairs))
  )

  return participants.map((giver, i) => ({
    giver,
    receiver: shuffled[i],
  }))
}
