'use client'

import { useState, useSyncExternalStore, type FormEvent } from 'react'
import { Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'tf_onboarding_complete'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

function getCompletedSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

function getServerSnapshot() {
  return false
}

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const completed = useSyncExternalStore(subscribe, getCompletedSnapshot, getServerSnapshot)
  const [justCompleted, setJustCompleted] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const needsOnboarding = !completed && !justCompleted

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Le nom complet est requis')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Adresse email invalide')
      return
    }
    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() }),
      })
      if (!res.ok) throw new Error()

      localStorage.setItem(STORAGE_KEY, '1')
      setJustCompleted(true)
    } catch {
      setError("Erreur lors de l'envoi, réessayez")
    } finally {
      setSending(false)
    }
  }

  if (!needsOnboarding) return <>{children}</>

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <Gift className="h-8 w-8 text-red-500" />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Bienvenue !</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Avant de commencer, indiquez-nous vos coordonnées.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="onboarding-name" className="mb-1 block text-xs font-medium text-gray-600">
              Nom complet
            </label>
            <Input
              id="onboarding-name"
              placeholder="Jean Dupont"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="onboarding-email" className="mb-1 block text-xs font-medium text-gray-600">
              Email
            </label>
            <Input
              id="onboarding-email"
              type="email"
              placeholder="jean@exemple.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="onboarding-phone" className="mb-1 block text-xs font-medium text-gray-600">
              Téléphone
            </label>
            <Input
              id="onboarding-phone"
              type="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={sending} className="w-full bg-red-500 py-5 hover:bg-red-600">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...
              </>
            ) : (
              'Continuer'
            )}
          </Button>

          <p className="text-center text-[11px] text-gray-400">
            Vos coordonnées ne sont utilisées que pour vous contacter au sujet de vos tirages.
          </p>
        </form>
      </div>
    </div>
  )
}
