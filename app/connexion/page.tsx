'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

// N'autorise que les chemins internes relatifs — un `next` du type
// "https://evil.example" ou "//evil.example" (protocol-relative) redirigerait
// hors du site après une connexion réussie sinon.
function sanitizeNext(rawNext: string | null): string {
  if (!rawNext) return '/'
  if (!rawNext.startsWith('/') || rawNext.startsWith('//') || rawNext.startsWith('/\\')) return '/'
  return rawNext
}

function ConnexionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError('Email ou mot de passe incorrect')
        return
      }

      const fullName = data.user?.user_metadata?.full_name
      const phone = data.user?.user_metadata?.phone
      if (fullName && phone) {
        fetch('/api/auth/inscription-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email: email.trim(), phone }),
        }).catch(() => {})
      }

      router.push(next)
      router.refresh()
    } catch {
      setError('Erreur de connexion, réessayez')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">Connexion</h1>
      <p className="mb-6 text-center text-sm text-gray-500">Content de te revoir !</p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-gray-600">
            Email
          </label>
          <Input id="email" type="email" placeholder="jean@exemple.com" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-gray-600">
            Mot de passe
          </label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" disabled={sending} className="w-full bg-red-500 py-5 hover:bg-red-600">
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>

        <p className="text-center text-xs text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-red-500 underline">
            S&apos;inscrire
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function ConnexionPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <Gift className="h-8 w-8 text-red-500" />
      </div>
      <Suspense fallback={null}>
        <ConnexionForm />
      </Suspense>
    </div>
  )
}
