import { NextRequest, NextResponse } from 'next/server'
import { transporter } from '@/lib/mailer'
import { siteConfig } from '@/lib/site-config'
import { escapeHtml, hasNoLineBreaks, isValidEmail } from '@/lib/validation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Payload = {
  fullName: string
  email: string
  phone: string
}

function isValidPayload(body: unknown): body is Payload {
  if (!body || typeof body !== 'object') return false
  const { fullName, email, phone } = body as Record<string, unknown>
  return (
    typeof fullName === 'string' && fullName.trim().length > 0 && hasNoLineBreaks(fullName) &&
    typeof email === 'string' && isValidEmail(email) && hasNoLineBreaks(email) &&
    typeof phone === 'string' && phone.trim().length > 0 && hasNoLineBreaks(phone)
  )
}

// Notifie le propriétaire du site à chaque nouvelle inscription. Le compte lui-même
// est déjà créé côté client via supabase.auth.signUp — cette route ne fait qu'informer,
// donc on vérifie juste qu'une session vient d'être établie pour ce même email avant d'envoyer.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!isValidPayload(body)) {
      return NextResponse.json({ ok: false, error: 'Informations invalides' }, { status: 400 })
    }
    const { fullName, email, phone } = body

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.email?.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ ok: false, error: 'Non autorisé' }, { status: 401 })
    }

    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('notified_owner')
      .eq('id', user.id)
      .single()

    // Déjà notifié (ex: reconnexions suivantes) — évite les doublons d'email.
    if (profile?.notified_owner) {
      return NextResponse.json({ ok: true })
    }

    const safeFullName = escapeHtml(fullName.trim())
    const safeEmail = escapeHtml(email.trim())
    const safePhone = escapeHtml(phone.trim())

    await transporter.sendMail({
      from: `"${siteConfig.site.name}" <${process.env.SMTP_USER}>`,
      to: siteConfig.notifications.recipientEmail,
      replyTo: email.trim(),
      subject: `👋 Nouvelle inscription — ${fullName.trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h1 style="color: #1a1a1a; font-size: 20px;">Nouvelle inscription</h1>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Nom complet</td>
              <td style="padding: 8px 0; color: #1a1a1a; font-weight: bold;">${safeFullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Email</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 13px;">Téléphone</td>
              <td style="padding: 8px 0; color: #1a1a1a;">${safePhone}</td>
            </tr>
          </table>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Envoyé automatiquement depuis le formulaire d'inscription de ${escapeHtml(siteConfig.site.name)}.
          </p>
        </div>
      `,
    })

    await admin.from('profiles').update({ notified_owner: true }).eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[inscription-notification]', err)
    return NextResponse.json({ ok: false, error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
