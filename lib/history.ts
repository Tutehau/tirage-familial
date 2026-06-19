import type { Assignment } from '@/lib/draw-engine'

const STORAGE_KEY = 'tirage-familial-history'

export type DrawRecord = {
  year: number
  titre: string
  assignments: Assignment[]
}

function loadHistory(): DrawRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as DrawRecord[]
  } catch {
    return []
  }
}

function saveHistory(history: DrawRecord[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export function saveDrawToHistory(record: DrawRecord): void {
  const history = loadHistory()
  // Remplacer si un tirage existe déjà pour cette année
  const idx = history.findIndex(r => r.year === record.year)
  if (idx >= 0) {
    history[idx] = record
  } else {
    history.push(record)
  }
  saveHistory(history)
}

export function getLastYearPairs(currentYear: number): Assignment[] {
  const history = loadHistory()
  const lastYear = history.find(r => r.year === currentYear - 1)
  return lastYear?.assignments ?? []
}

export function getFullHistory(): DrawRecord[] {
  return loadHistory()
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
