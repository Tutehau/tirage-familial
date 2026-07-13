'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isValidEmail } from '@/lib/validation'

export default function InscriptionPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [confirmationPending, setConfirmationPending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim()) {
      setError('Le nom complet est requis')
      return
    }
    if (!isValidEmail(email)) {
      setError('Adresse email invalide')
      return
    }
    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis')
      return
    }
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setSending(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim(), phone: phone.trim() },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      // Si la confirmation email est activée sur le projet Supabase, il n'y a pas
      // encore de session à ce stade — on ne peut pas encore appeler la route de
      // notification (elle exige une session) ni rediriger vers l'app.
      if (!data.session) {
        setConfirmationPending(true)
        return
      }

      await fetch('/api/auth/inscription-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim() }),
      }).catch(() => {})

      router.push('/')
      router.refresh()
    } catch {
      setError("Erreur lors de l'inscription, réessayez")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <Gift className="h-8 w-8 text-red-500" />
      </div>

      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Créer un compte</h1>

        {confirmationPending ? (
          <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-gray-700">
              Compte créé ! Vérifie ta boîte mail (<strong>{email}</strong>) et clique sur le lien de
              confirmation pour te connecter.
            </p>
            <Link href="/connexion" className="text-sm text-red-500 underline">
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-center text-sm text-gray-500">
              Renseigne tes coordonnées pour organiser tes tirages.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-xs font-medium text-gray-600">
              Nom complet
            </label>
            <Input id="fullName" placeholder="Jean Dupont" value={fullName} onChange={e => setFullName(e.target.value)} autoFocus />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-600">
              Email
            </label>
            <Input id="email" type="email" placeholder="jean@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-medium text-gray-600">
              Téléphone
            </label>
            <Input id="phone" type="tel" placeholder="06 12 34 56 78" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-600">
              Mot de passe
            </label>
            <Input id="password" type="password" placeholder="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={sending} className="w-full bg-red-500 py-5 hover:bg-red-600">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...
              </>
            ) : (
              'Créer mon compte'
            )}
          </Button>

          <p className="text-center text-xs text-gray-500">
            Déjà un compte ?{' '}
            <Link href="/connexion" className="text-red-500 underline">
              Se connecter
            </Link>
          </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
