'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Gift, Search } from 'lucide-react'
import type { Assignment } from '@/lib/draw-engine'
import { findMyReceiver } from '@/lib/encoding'

export function RevealCard({ assignments }: { assignments: Assignment[] }) {
  const [name, setName] = useState('')
  const [receiver, setReceiver] = useState<string | null | undefined>(undefined)
  const [revealed, setRevealed] = useState(false)

  function chercher() {
    const trimmed = name.trim()
    if (!trimmed) return
    const found = findMyReceiver(assignments, trimmed)
    setReceiver(found)
    if (found) setRevealed(true)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') chercher()
  }

  function reset() {
    setName('')
    setReceiver(undefined)
    setRevealed(false)
  }

  if (revealed && receiver) {
    return (
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-red-400 to-red-600 p-8 text-center text-white">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <Gift className="h-10 w-10" />
            </div>
          </div>
          <p className="mb-1 text-lg opacity-90">Tu offres un cadeau à...</p>
          <p className="text-4xl font-bold">{receiver}</p>
          <p className="mt-4 text-sm opacity-75">Chut ! Ne dis rien à personne 🤫</p>
        </div>
        <CardContent className="pt-4">
          <Button onClick={reset} variant="outline" className="w-full">
            Voir un autre résultat
          </Button>
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

        <div className="flex gap-2">
          <Input
            placeholder="Ton prénom..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-base"
            autoFocus
          />
          <Button
            onClick={chercher}
            className="bg-red-500 hover:bg-red-600"
            aria-label="Chercher"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {receiver === null && (
          <p className="text-center text-sm text-red-500">
            Prénom &quot;{name}&quot; non trouvé dans ce tirage. Vérifie l&apos;orthographe.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
