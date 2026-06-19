import { ParticipantForm } from '@/components/participant-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NouveauPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </Link>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">Nouveau tirage</h1>
      <p className="mb-8 text-gray-500">
        Ajoutez les prénoms de tous les participants, puis lancez le tirage.
      </p>

      <ParticipantForm />
    </main>
  )
}
