import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest, { params }: { params: Promise<{ drawId: string }> }) {
  const { drawId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: 'Non authentifié' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: drawRow } = await admin.from('draws').select('id, titre').eq('id', drawId).maybeSingle()

  if (!drawRow) {
    return NextResponse.json({ ok: false, error: 'Tirage introuvable' }, { status: 404 })
  }

  const { count } = await admin
    .from('assignments')
    .select('id', { count: 'exact', head: true })
    .eq('draw_id', drawId)

  return NextResponse.json({ ok: true, titre: drawRow.titre, participantCount: count ?? 0 })
}
