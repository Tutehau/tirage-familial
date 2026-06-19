import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import type { Assignment } from '@/lib/draw-engine'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

type ParticipantPayload = {
  type: 'participant'
  participantName: string
  participantEmail: string
  receiverName: string
  titre: string
}

type OrganizerPayload = {
  type: 'organizer'
  organizerEmail: string
  assignments: Assignment[]
  titre: string
}

type Payload = ParticipantPayload | OrganizerPayload

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload

    if (body.type === 'participant') {
      await transporter.sendMail({
        from: `"Tirage Familial" <${process.env.SMTP_USER}>`,
        to: body.participantEmail,
        subject: `🎁 ${body.titre} — Ton tirage au sort`,
        html: buildParticipantEmail(body),
      })
    } else {
      await transporter.sendMail({
        from: `"Tirage Familial" <${process.env.SMTP_USER}>`,
        to: body.organizerEmail,
        subject: `📋 ${body.titre} — Liste complète du tirage`,
        html: buildOrganizerEmail(body),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[envoyer-email]', err)
    return NextResponse.json(
      { ok: false, error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    )
  }
}

function buildParticipantEmail({ participantName, receiverName, titre }: ParticipantPayload): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px;">🎁</div>
        <h1 style="color: #1a1a1a; font-size: 24px; margin: 16px 0 4px;">${titre}</h1>
      </div>

      <p style="color: #444; font-size: 16px;">Salut <strong>${participantName}</strong> !</p>
      <p style="color: #444; font-size: 16px;">Cette année, tu offres un cadeau à :</p>

      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; opacity: 0.85;">Tu offres un cadeau à...</p>
        <p style="margin: 8px 0 0; font-size: 36px; font-weight: bold;">${receiverName}</p>
        <p style="margin: 16px 0 0; font-size: 13px; opacity: 0.75;">Chut ! Ne dis rien à personne 🤫</p>
      </div>

      <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">
        Cet email a été envoyé automatiquement par l'application Tirage Familial.
      </p>
    </div>
  `
}

function buildOrganizerEmail({ assignments, titre }: OrganizerPayload): string {
  const rows = assignments
    .map(
      a => `
        <tr>
          <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; color: #444;">${a.giver}</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; color: #888; text-align: center;">→</td>
          <td style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; color: #ef4444; font-weight: bold;">${a.receiver}</td>
        </tr>
      `
    )
    .join('')

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 48px;">📋</div>
        <h1 style="color: #1a1a1a; font-size: 24px; margin: 16px 0 4px;">${titre}</h1>
        <p style="color: #888; font-size: 14px; margin: 0;">Liste complète — confidentiel</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 12px 16px; text-align: left; color: #666; font-size: 13px; font-weight: 600;">Offre un cadeau</th>
            <th style="padding: 12px 16px;"></th>
            <th style="padding: 12px 16px; text-align: left; color: #666; font-size: 13px; font-weight: 600;">À</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <p style="color: #888; font-size: 13px; text-align: center; margin-top: 32px;">
        ${assignments.length} participants — Gardez cette liste confidentielle.
      </p>
    </div>
  `
}
