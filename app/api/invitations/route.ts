import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const FROM_EMAIL = process.env.SMTP_USER || 'daniel@regenerandoando.com'
const FROM_NAME = 'Regenerando Ando'

// GET: fetch user's invitations + personal code
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Get or create personal invitation code (one with no email = shareable link)
    let { data: personalInvite } = await supabaseAdmin
      .from('invitations')
      .select('invitation_code')
      .eq('invited_by', user.id)
      .is('invited_email', null)
      .limit(1)
      .single()

    if (!personalInvite) {
      const { data: newInvite } = await supabaseAdmin
        .from('invitations')
        .insert({ invited_by: user.id })
        .select('invitation_code')
        .single()
      personalInvite = newInvite
    }

    // Get all invitations by this user
    const { data: invitations } = await supabaseAdmin
      .from('invitations')
      .select('id, invited_name, invited_email, status, created_at, registered_at')
      .eq('invited_by', user.id)
      .not('invited_email', 'is', null)
      .order('created_at', { ascending: false })

    // Count registered
    const { count } = await supabaseAdmin
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('invited_by', user.id)
      .eq('status', 'registered')

    return NextResponse.json({
      personalCode: personalInvite?.invitation_code || '',
      invitations: invitations || [],
      registeredCount: count || 0,
    })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST: create invitation + optionally send email
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const { invitedName, invitedEmail } = body

    if (!invitedEmail) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Get inviter profile
    const { data: inviterProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, ranch_name, status')
      .eq('id', user.id)
      .single()

    if (!inviterProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Create invitation
    const { data: invitation, error: insertError } = await supabaseAdmin
      .from('invitations')
      .insert({
        invited_by: user.id,
        invited_name: invitedName || null,
        invited_email: invitedEmail,
        status: 'pending',
      })
      .select('invitation_code')
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Error al crear invitación' }, { status: 500 })
    }

    // Send invitation email
    try {
      const registroUrl = `https://www.regenerandoando.com/auth/registro?ref=${invitation.invitation_code}`
      const transporter = getTransporter()

      await transporter.sendMail({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: invitedEmail,
        subject: `🌱 ${inviterProfile.full_name} te invita a Regenerando Ando`,
        html: invitationEmailTemplate({
          inviterName: inviterProfile.full_name,
          ranchName: inviterProfile.ranch_name,
          invitedName: invitedName || '',
          registroUrl,
        }),
      })
    } catch {
      // Email failed but invitation was created
    }

    return NextResponse.json({ success: true, code: invitation.invitation_code })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

function invitationEmailTemplate({ inviterName, ranchName, invitedName, registroUrl }: {
  inviterName: string; ranchName: string; invitedName: string; registroUrl: string
}) {
  const greeting = invitedName ? `Hola, ${invitedName}` : 'Hola'
  const ranchText = ranchName ? ` de <strong>${ranchName}</strong>` : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 24px; font-weight: 700;">
        <span style="color: #111;">regenerando</span><span style="color: #1D9E75;">ando</span>
      </span>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="color: #0F6E56; font-size: 24px; margin-bottom: 16px;">
        ${greeting}
      </h1>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        <strong>${inviterName}</strong>${ranchText} te invita a registrar tu rancho en
        <strong>Regenerando Ando</strong>, el directorio mundial de ganaderos regenerativos.
      </p>
      <div style="background-color: #E1F5EE; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="font-size: 15px; color: #0F6E56; margin: 0; line-height: 1.6;">
          <strong>¿Qué es Regenerando Ando?</strong><br>
          Un espacio para visibilizar, conectar y documentar a los ganaderos que ya practican
          ganadería regenerativa. Tu perfil es tu página pública donde muestras tu rancho,
          tus resultados y tu historia.
        </p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${registroUrl}" style="background-color: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Registrar mi rancho
        </a>
      </div>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Es gratis y siempre lo será. Tú decides cuánta información compartir.
      </p>
    </div>
    <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0;">Regenerando Ando — El directorio mundial de ganaderos regenerativos</p>
      <p style="margin: 4px 0 0 0;">
        <a href="https://www.regenerandoando.com" style="color: #0F6E56; text-decoration: none;">regenerandoando.com</a>
      </p>
    </div>
  </div>
</body>
</html>`
}
