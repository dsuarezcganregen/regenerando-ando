import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FROM_EMAIL = process.env.SMTP_USER || 'daniel@regenerandoando.com'
const FROM_NAME = 'Regenerando Ando'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'daniel@regenerandoando.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, profileId, reason, token } = body

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify user is admin (skip for welcome/new_registration from self)
    if (type !== 'welcome' && type !== 'new_registration') {
      const { data: adminData } = await supabaseAdmin
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (!adminData) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
    }

    // Get profile info
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email, ranch_name, slug')
      .eq('id', profileId)
      .single()

    if (!profile || !profile.email) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const transporter = getTransporter()

    switch (type) {
      case 'approved':
        await sendApprovedEmail(transporter, profile)
        break
      case 'rejected':
        await sendRejectedEmail(transporter, profile, reason)
        break
      case 'returned_pending':
        await sendReturnedPendingEmail(transporter, profile, reason)
        break
      case 'welcome':
        await sendWelcomeEmail(transporter, profile)
        break
      case 'new_registration':
        await sendNewRegistrationToAdmin(transporter, profile)
        break
      default:
        return NextResponse.json({ error: 'Tipo de email no válido' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 })
  }
}

// ===================== EMAIL FUNCTIONS =====================

async function sendApprovedEmail(transporter: nodemailer.Transporter, profile: { full_name: string; email: string; ranch_name: string; slug: string }) {
  const profileUrl = `https://regenerandoando.com/rancho/${profile.slug}`

  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: profile.email,
    subject: '✅ ¡Tu perfil en Regenerando Ando fue aprobado!',
    html: baseTemplate(`
      <h1 style="color: #0F6E56; font-size: 24px; margin-bottom: 16px;">
        ¡Felicidades, ${profile.full_name}!
      </h1>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Tu perfil de <strong>${profile.ranch_name || 'tu rancho'}</strong> ya está publicado en el directorio mundial de ganaderos regenerativos.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        A partir de ahora, otros ganaderos y visitantes podrán encontrarte en el directorio, el mapa interactivo y conocer tu operación.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${profileUrl}" style="background-color: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Ver mi perfil público
        </a>
      </div>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Puedes editar tu información en cualquier momento desde tu panel en
        <a href="https://regenerandoando.com/mi-perfil" style="color: #0F6E56;">Mi Perfil</a>.
      </p>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Si tienes resultados ambientales o económicos que compartir, te invitamos a llenar la sección de resultados en tu perfil. Esto ayuda a demostrar el impacto de la ganadería regenerativa.
      </p>
    `),
  })
}

async function sendRejectedEmail(transporter: nodemailer.Transporter, profile: { full_name: string; email: string; ranch_name: string; slug: string }, reason?: string) {
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: profile.email,
    subject: '⚠️ Tu perfil en Regenerando Ando necesita correcciones',
    html: baseTemplate(`
      <h1 style="color: #B45309; font-size: 24px; margin-bottom: 16px;">
        Hola, ${profile.full_name}
      </h1>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Revisamos tu perfil de <strong>${profile.ranch_name || 'tu rancho'}</strong> y necesita algunas correcciones antes de poder publicarlo.
      </p>
      ${reason ? `
      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="font-size: 14px; color: #92400E; margin: 0 0 4px 0; font-weight: 600;">Motivo:</p>
        <p style="font-size: 15px; color: #78350F; margin: 0; line-height: 1.5;">${reason}</p>
      </div>
      ` : ''}
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Por favor revisa la información y haz las correcciones necesarias. Una vez que actualices tu perfil, lo revisaremos nuevamente.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://regenerandoando.com/mi-perfil/editar" style="background-color: #B45309; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Editar mi perfil
        </a>
      </div>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Si tienes dudas, responde a este correo y con gusto te ayudamos.
      </p>
    `),
  })
}

async function sendReturnedPendingEmail(transporter: nodemailer.Transporter, profile: { full_name: string; email: string; ranch_name: string; slug: string }, reason?: string) {
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: profile.email,
    subject: '🔄 Tu perfil en Regenerando Ando fue devuelto a revisión',
    html: baseTemplate(`
      <h1 style="color: #B45309; font-size: 24px; margin-bottom: 16px;">
        Hola, ${profile.full_name}
      </h1>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Tu perfil de <strong>${profile.ranch_name || 'tu rancho'}</strong> fue devuelto a estado de revisión.
        Esto puede deberse a que falta información o necesitamos verificar algunos datos.
      </p>
      ${reason ? `
      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
        <p style="font-size: 14px; color: #92400E; margin: 0 0 4px 0; font-weight: 600;">Nota del administrador:</p>
        <p style="font-size: 15px; color: #78350F; margin: 0; line-height: 1.5;">${reason}</p>
      </div>
      ` : ''}
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Te recomendamos comunicarte con nosotros para resolver cualquier duda o completar
        la información que haga falta. Puedes escribirnos directamente a:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="mailto:daniel@regenerandoando.com" style="font-size: 16px; color: #0F6E56; font-weight: 600; text-decoration: none;">
          daniel@regenerandoando.com
        </a>
      </div>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        También puedes revisar y actualizar tu perfil desde tu panel:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://regenerandoando.com/mi-perfil/editar" style="background-color: #B45309; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Revisar mi perfil
        </a>
      </div>
      <p style="font-size: 14px; color: #666; line-height: 1.6;">
        Con gusto te ayudamos a completar tu registro. ¡Estamos para apoyarte!
      </p>
    `),
  })
}

async function sendWelcomeEmail(transporter: nodemailer.Transporter, profile: { full_name: string; email: string; ranch_name: string; slug: string }) {
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: profile.email,
    subject: '🌱 Bienvenido a Regenerando Ando',
    html: baseTemplate(`
      <h1 style="color: #0F6E56; font-size: 24px; margin-bottom: 16px;">
        ¡Bienvenido, ${profile.full_name}!
      </h1>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Gracias por registrarte en <strong>Regenerando Ando</strong>, el directorio mundial de ganaderos regenerativos.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Tu perfil está ahora <strong>en revisión</strong>. Nuestro equipo lo revisará pronto y te avisaremos cuando esté publicado.
      </p>
      <div style="background-color: #E1F5EE; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="font-size: 15px; color: #0F6E56; margin: 0; line-height: 1.6;">
          <strong>Mientras tanto, puedes:</strong>
        </p>
        <ul style="color: #0F6E56; font-size: 14px; margin: 8px 0 0 0; padding-left: 20px; line-height: 2;">
          <li>Completar tu perfil con más detalles</li>
          <li>Agregar fotos de tu rancho</li>
          <li>Llenar la sección de resultados</li>
        </ul>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://regenerandoando.com/mi-perfil" style="background-color: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Ir a mi perfil
        </a>
      </div>
    `),
  })
}

async function sendNewRegistrationToAdmin(transporter: nodemailer.Transporter, profile: { full_name: string; email: string; ranch_name: string; slug: string }) {
  await transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `📋 Nuevo registro: ${profile.full_name} — ${profile.ranch_name || 'Sin nombre de rancho'}`,
    html: baseTemplate(`
      <h1 style="color: #0F6E56; font-size: 24px; margin-bottom: 16px;">
        Nuevo ganadero registrado
      </h1>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Nombre:</strong> ${profile.full_name}</p>
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Rancho:</strong> ${profile.ranch_name || 'No especificado'}</p>
        <p style="margin: 0; font-size: 15px;"><strong>Email:</strong> ${profile.email}</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://regenerandoando.com/admin/perfiles" style="background-color: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Revisar en el panel
        </a>
      </div>
    `),
  })
}

// ===================== BASE TEMPLATE =====================

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <span style="font-size: 24px; font-weight: 700;">
        <span style="color: #111;">regenerando</span><span style="color: #1D9E75;">ando</span>
      </span>
    </div>

    <!-- Card -->
    <div style="background-color: white; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      ${content}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0;">Regenerando Ando — El directorio mundial de ganaderos regenerativos</p>
      <p style="margin: 4px 0 0 0;">
        <a href="https://regenerandoando.com" style="color: #0F6E56; text-decoration: none;">regenerandoando.com</a>
        &nbsp;·&nbsp;
        <a href="https://regenerandoando.com/privacidad" style="color: #9CA3AF; text-decoration: none;">Política de privacidad</a>
      </p>
    </div>
  </div>
</body>
</html>`
}
