'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Shuffle } from 'lucide-react'
import { draw } from '@/lib/draw-engine'
import { encodeAssignments } from '@/lib/encoding'

export function ParticipantForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function addParticipant() {
    const name = inputValue.trim()
    if (!name) return
    const duplicate = participants.some(p => p.toLowerCase() === name.toLowerCase())
    if (duplicate) {
      setError(`"${name}" est déjà dans la liste`)
      return
    }
    setParticipants(prev => [...prev, name])
    setInputValue('')
    setError(null)
    inputRef.current?.focus()
  }

  function removeParticipant(name: string) {
    setParticipants(prev => prev.filter(p => p !== name))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addParticipant()
    }
  }

  function lancerTirage() {
    setError(null)
    try {
      const assignments = draw(participants)
      const token = encodeAssignments(assignments)
      const params = new URLSearchParams({ d: token })
      if (title.trim()) params.set('titre', title.trim())
      router.push(`/tirage?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du tirage')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Titre du tirage (optionnel)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="ex: Noël 2026"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="text-base"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Prénom..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-base"
              autoFocus
            />
            <Button
              onClick={addParticipant}
              variant="outline"
              size="icon"
              aria-label="Ajouter"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {participants.map(name => (
                <Badge
                  key={name}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 text-sm"
                >
                  {name}
                  <button
                    onClick={() => removeParticipant(name)}
                    className="ml-1 rounded-full hover:text-red-500"
                    aria-label={`Supprimer ${name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {participants.length === 0 && (
            <p className="text-sm text-gray-400">Aucun participant pour l&apos;instant</p>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={lancerTirage}
        disabled={participants.length < 2}
        className="w-full bg-red-500 py-6 text-lg hover:bg-red-600 disabled:opacity-40"
      >
        <Shuffle className="mr-2 h-5 w-5" />
        Lancer le tirage
        {participants.length >= 2 && ` (${participants.length} participants)`}
      </Button>

      {participants.length === 1 && (
        <p className="text-center text-sm text-gray-400">
          Ajoutez au moins un autre participant pour lancer le tirage
        </p>
      )}
    </div>
  )
}
