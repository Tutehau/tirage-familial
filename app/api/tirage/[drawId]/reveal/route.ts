import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendParticipantResultEmail } from '@/lib/emails'
import { escapeLikePattern, hasNoLineBreaks } from '@/lib/validation'

export async function POST(req: NextRequest, { params }: { params: Promise<{ drawId: string }> }) {
  try {
    const { drawId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    if (!name || !hasNoLineBreaks(name)) {
      return NextResponse.json({ ok: false, error: 'Prénom invalide' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: drawRow } = await admin.from('draws').select('titre').eq('id', drawId).maybeSingle()
    if (!drawRow) {
      return NextResponse.json({ ok: false, error: 'Tirage introuvable' }, { status: 404 })
    }

    // Un compte ne peut révéler qu'un seul prénom par tirage — empêche de "parcourir"
    // les résultats des autres en changeant simplement de prénom saisi.
    const { data: alreadyRevealed } = await admin
      .from('assignments')
      .select('id, giver_name, receiver_name')
      .eq('draw_id', drawId)
      .eq('revealed_by', user.id)
      .maybeSingle()

    const { data: match } = await admin
      .from('assignments')
      .select('id, giver_name, receiver_name, revealed_by')
      .eq('draw_id', drawId)
      .ilike('giver_name', escapeLikePattern(name))
      .maybeSingle()

    if (!match) {
      return NextResponse.json(
        { ok: false, error: `Prénom "${name}" non trouvé. Vérifie l'orthographe.` },
        { status: 404 }
      )
    }

    if (alreadyRevealed && alreadyRevealed.id !== match.id) {
      return NextResponse.json(
        { ok: false, error: 'Tu as déjà révélé ton résultat pour ce tirage sous un autre prénom.' },
        { status: 403 }
      )
    }

    if (match.revealed_by && match.revealed_by !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Ce résultat a déjà été révélé par quelqu\'un d\'autre.' },
        { status: 403 }
      )
    }

    if (!match.revealed_by) {
      await admin
        .from('assignments')
        .update({ revealed_by: user.id, revealed_at: new Date().toISOString() })
        .eq('id', match.id)

      try {
        await sendParticipantResultEmail({
          participantName: match.giver_name,
          participantEmail: user.email,
          receiverName: match.receiver_name,
          titre: drawRow.titre,
        })
      } catch (err) {
        console.error('[tirage/reveal] email participant', err)
      }
    }

    return NextResponse.json({ ok: true, receiver: match.receiver_name })
  } catch (err) {
    console.error('[tirage/reveal]', err)
    return NextResponse.json({ ok: false, error: 'Erreur lors de la révélation' }, { status: 500 })
  }
}
