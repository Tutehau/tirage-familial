'use client'

import { useState, useSyncExternalStore } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

export function SharePanel({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-dashed border-green-300 bg-green-50 p-4">
      <p className="mb-3 text-sm font-medium text-green-700">
        Partagez ce lien avec tous les participants
      </p>
      <div className="flex gap-2">
        <p className="flex-1 truncate rounded-lg border border-green-200 bg-white px-3 py-2 text-xs text-gray-500">
          {url}
        </p>
        <Button
          onClick={copyLink}
          size="sm"
          className={copied ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
        >
          {copied ? (
            <><Check className="mr-1 h-3 w-3" /> Copié !</>
          ) : (
            <><Copy className="mr-1 h-3 w-3" /> Copier</>
          )}
        </Button>
      </div>
      <p className="mt-2 text-xs text-green-600">
        Chaque personne devra se connecter (ou créer un compte) puis saisir son prénom — seul son
        propre résultat lui sera montré.
      </p>
    </div>
  )
}

function subscribe() {
  return () => {}
}

export function ShareLink({ drawId }: { drawId: string }) {
  const origin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ''
  )
  if (!origin) return null
  return <SharePanel url={`${origin}/tirage/${drawId}`} />
}
