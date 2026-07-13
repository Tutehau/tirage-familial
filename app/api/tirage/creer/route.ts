import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { draw } from '@/lib/draw-engine'
import { sendOrganizerSummaryEmail } from '@/lib/emails'

type Payload = {
  titre: string
  participants: string[]
}

function isValidPayload(body: unknown): body is Payload {
  if (!body || typeof body !== 'object') return false
  const { titre, participants } = body as Record<string, unknown>
  return (
    typeof titre === 'string' &&
    Array.isArray(participants) &&
    participants.length >= 2 &&
    participants.every(p => typeof p === 'string' && p.trim().length > 0)
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json({ ok: false, error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    if (!isValidPayload(body)) {
      return NextResponse.json({ ok: false, error: 'Données invalides' }, { status: 400 })
    }

    const participants = body.participants.map(p => p.trim())
    const year = new Date().getFullYear()
    const titre = body.titre.trim() || `Tirage ${year}`

    const admin = createAdminClient()

    // Exclut les paires du tirage précédent (même organisateur, année-1) pour ne pas répéter.
    const { data: previousDraw } = await admin
      .from('draws')
      .select('id')
      .eq('organizer_id', user.id)
      .eq('year', year - 1)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let excludePairs: { giver: string; receiver: string }[] = []
    if (previousDraw) {
      const { data: previousAssignments } = await admin
        .from('assignments')
        .select('giver_name, receiver_name')
        .eq('draw_id', previousDraw.id)

      excludePairs = (previousAssignments ?? []).map(a => ({
        giver: a.giver_name,
        receiver: a.receiver_name,
      }))
    }

    let assignments
    try {
      assignments = draw(participants, { excludePairs })
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : 'Erreur lors du tirage' },
        { status: 400 }
      )
    }

    const { data: newDraw, error: insertDrawError } = await admin
      .from('draws')
      .insert({ organizer_id: user.id, titre, year })
      .select('id')
      .single()

    if (insertDrawError || !newDraw) {
      throw insertDrawError ?? new Error('Échec de la création du tirage')
    }

    const { error: insertAssignmentsError } = await admin.from('assignments').insert(
      assignments.map(a => ({ draw_id: newDraw.id, giver_name: a.giver, receiver_name: a.receiver }))
    )

    if (insertAssignmentsError) throw insertAssignmentsError

    try {
      await sendOrganizerSummaryEmail({ organizerEmail: user.email, assignments, titre })
    } catch (err) {
      console.error('[tirage/creer] email organisateur', err)
    }

    return NextResponse.json({ ok: true, drawId: newDraw.id, titre })
  } catch (err) {
    console.error('[tirage/creer]', err)
    return NextResponse.json({ ok: false, error: 'Erreur lors de la création du tirage' }, { status: 500 })
  }
}
