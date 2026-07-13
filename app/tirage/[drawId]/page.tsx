import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { RevealCard } from '@/components/reveal-card'
import { ShareLink } from '@/components/share-panel'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function TiragePage({ params }: { params: Promise<{ drawId: string }> }) {
  const { drawId } = await params
  const admin = createAdminClient()

  const { data: drawRow } = await admin.from('draws').select('titre').eq('id', drawId).maybeSingle()
  if (!drawRow) notFound()

  const { count } = await admin
    .from('assignments')
    .select('id', { count: 'exact', head: true })
    .eq('draw_id', drawId)

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Accueil
      </Link>

      <h1 className="mb-1 text-2xl font-bold text-gray-900">{drawRow.titre}</h1>
      <p className="mb-6 text-gray-500">{count ?? 0} participants</p>

      <div className="space-y-6">
        <RevealCard drawId={drawId} />
        <ShareLink drawId={drawId} />
      </div>
    </main>
  )
}
