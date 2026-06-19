'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import Link from 'next/link'
import { RevealCard } from '@/components/reveal-card'
import { SharePanel } from '@/components/share-panel'
import { decodeAssignments } from '@/lib/encoding'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export function TiragePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('d')
  const titre = searchParams.get('titre')

  const { assignments, error } = useMemo(() => {
    if (!token) return { assignments: null, error: 'Lien de tirage invalide ou incomplet.' }
    try {
      const assignments = decodeAssignments(token)
      return { assignments, error: null }
    } catch {
      return { assignments: null, error: 'Ce lien de tirage est invalide ou corrompu.' }
    }
  }, [token])

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  if (error || !assignments) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
        <h1 className="mb-2 text-xl font-semibold text-gray-800">Lien invalide</h1>
        <p className="mb-6 text-gray-500">{error}</p>
        <Link href="/nouveau" className="text-red-500 underline">
          Créer un nouveau tirage
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        {titre || 'Tirage au sort'}
      </h1>
      <p className="mb-6 text-gray-500">{assignments.length} participants</p>

      <div className="space-y-6">
        <RevealCard assignments={assignments} />
        {shareUrl && <SharePanel url={shareUrl} />}
      </div>
    </main>
  )
}
