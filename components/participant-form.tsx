'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Shuffle, History, Loader2 } from 'lucide-react'
import { draw } from '@/lib/draw-engine'
import { encodeAssignments } from '@/lib/encoding'
import { getLastYearPairs, saveDrawToHistory } from '@/lib/history'
import type { Assignment } from '@/lib/draw-engine'

export function ParticipantForm() {
  const router = useRouter()
  const [titre, setTitre] = useState('')
  const [organizerEmail, setOrganizerEmail] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [lastYearPairs, setLastYearPairs] = useState<Assignment[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    setLastYearPairs(getLastYearPairs(currentYear))
  }, [currentYear])

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

  const relevantLastYearPairs = lastYearPairs.filter(
    p =>
      participants.some(n => n.toLowerCase() === p.giver.toLowerCase()) &&
      participants.some(n => n.toLowerCase() === p.receiver.toLowerCase())
  )

  async function lancerTirage() {
    setError(null)

    if (!organizerEmail.trim()) {
      setError('L\'email de l\'organisateur est requis')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organizerEmail.trim())) {
      setError('Adresse email invalide')
      return
    }

    setSending(true)
    try {
      const assignments = draw(participants, { excludePairs: relevantLastYearPairs })
      const titreEffectif = titre.trim() || `Tirage ${currentYear}`

      saveDrawToHistory({
        year: currentYear,
        titre: titreEffectif,
        assignments,
      })

      // Envoyer la liste complète à l'organisateur
      await fetch('/api/envoyer-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'organizer',
          organizerEmail: organizerEmail.trim(),
          assignments,
          titre: titreEffectif,
        }),
      })

      const token = encodeAssignments(assignments)
      const params = new URLSearchParams({ d: token })
      params.set('titre', titreEffectif)
      router.push(`/tirage?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du tirage')
    } finally {
      setSending(false)
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
            placeholder={`ex: Noël ${currentYear}`}
            value={titre}
            onChange={e => setTitre(e.target.value)}
            className="text-base"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-700">Votre email (organisateur)</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="email"
            placeholder="contact@exemple.com"
            value={organizerEmail}
            onChange={e => setOrganizerEmail(e.target.value)}
            className="text-base"
          />
          <p className="mt-2 text-xs text-gray-400">
            Vous recevrez la liste complète du tirage par email.
          </p>
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

          {error && <p className="text-sm text-red-500">{error}</p>}

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

      {relevantLastYearPairs.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <History className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {relevantLastYearPairs.length} paire{relevantLastYearPairs.length > 1 ? 's' : ''} de l&apos;an dernier ({currentYear - 1}) seront évitées automatiquement.
          </span>
        </div>
      )}

      <Button
        onClick={lancerTirage}
        disabled={participants.length < 2 || sending}
        className="w-full bg-red-500 py-6 text-lg hover:bg-red-600 disabled:opacity-40"
      >
        {sending ? (
          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours...</>
        ) : (
          <><Shuffle className="mr-2 h-5 w-5" />
          Lancer le tirage
          {participants.length >= 2 && ` (${participants.length} participants)`}</>
        )}
      </Button>

      {participants.length === 1 && (
        <p className="text-center text-sm text-gray-400">
          Ajoutez au moins un autre participant pour lancer le tirage
        </p>
      )}
    </div>
  )
}
