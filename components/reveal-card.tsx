'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Gift, Lock, Loader2 } from 'lucide-react'

type State =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'revealed'; receiverName: string; participantName: string }
  | { status: 'error'; message: string }

export function RevealCard({ drawId }: { drawId: string }) {
  const [name, setName] = useState('')
  const [state, setState] = useState<State>({ status: 'idle' })

  async function chercher() {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setState({ status: 'error', message: 'Entre ton prénom.' })
      return
    }

    setState({ status: 'sending' })

    try {
      const res = await fetch(`/api/tirage/${drawId}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      })
      const data = await res.json()

      if (!res.ok || !data.ok) {
        setState({ status: 'error', message: data.error || 'Erreur lors de la révélation' })
        return
      }

      setState({ status: 'revealed', receiverName: data.receiver, participantName: trimmedName })
    } catch {
      setState({ status: 'error', message: 'Erreur réseau, réessaie.' })
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') chercher()
  }

  if (state.status === 'revealed') {
    return (
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-8 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Gift className="h-10 w-10" />
            </div>
          </div>
          <p className="mb-1 text-lg opacity-90">Tu offres un cadeau à...</p>
          <p className="text-4xl font-bold">{state.receiverName}</p>
          <p className="mt-4 text-sm opacity-75">Un email de confirmation a été envoyé. Chut ! 🤫</p>
        </div>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="h-3.5 w-3.5" />
            <span>Résultat de {state.participantName} — page personnelle</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="text-center">
          <Gift className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="text-xl font-semibold text-gray-800">Qui est ton destinataire ?</h2>
          <p className="mt-1 text-sm text-gray-500">
            Entre ton prénom pour découvrir à qui tu offres un cadeau
          </p>
        </div>

        <Input
          placeholder="Ton prénom..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-base"
          autoFocus
          disabled={state.status === 'sending'}
        />

        {state.status === 'error' && (
          <p className="text-center text-sm text-red-500">{state.message}</p>
        )}

        <Button
          onClick={chercher}
          disabled={state.status === 'sending'}
          className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-40"
        >
          {state.status === 'sending' ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...</>
          ) : (
            'Voir mon résultat et recevoir l\'email'
          )}
        </Button>

        <p className="text-center text-xs text-gray-400">
          Tu recevras un email de confirmation avec le nom de ton destinataire.
        </p>
      </CardContent>
    </Card>
  )
}
