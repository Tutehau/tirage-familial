import { NextRequest, NextResponse } from 'next/server'
import { transporter } from '@/lib/mailer'
import { siteConfig } from '@/lib/site-config'

type OnboardingPayload = {
  fullName: string
  email: string
  phone: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const hasNoLineBreaks = (value: string) => !/[\r\n]/.test(value)

function isValidPayload(body: unknown): body is OnboardingPayload {
  if (!body || typeof body !== 'object') return false
  const { fullName, email, phone } = body as Record<string, unknown>
  return (
    typeof fullName === 'string' && fullName.trim().length > 0 && hasNoLineBreaks(fullName) &&
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && hasNoLineBreaks(email) &&
    typeof phone === 'string' && phone.trim().length > 0 && hasNoLineBreaks(phone)
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!isValidPayload(body)) {
      return NextResponse.json({ ok: false, error: 'Informations invalides' }, { status: 400 })
    }

    const { fullName, email, phone } = body

    const safeFullName = escapeHtml(fullName.trim())
    const safeEmail = escapeHtml(email.trim())
    const safePhone = escapeHtml(phone.trim())

    await transporter.sendMail({
      from: `"${siteConfig.site.name}" <${process.env.SMTP_USER}>`,
      to: siteConfig.notifications.recipientEmail,
      replyTo: email.trim(),
      subject: `👋 Nouvel onboarding — ${fullName.trim()}`,
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
            Envoyé automatiquement depuis le formulaire d'accueil de ${siteConfig.site.name}.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[onboarding]', err)
    return NextResponse.json({ ok: false, error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
