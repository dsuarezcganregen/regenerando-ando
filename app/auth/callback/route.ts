import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const ref = searchParams.get('ref')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Use service role to bypass RLS when checking admin status
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (serviceKey) {
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceKey
        )
        const { data: admin } = await supabaseAdmin
          .from('admins')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (admin) {
          return NextResponse.redirect(`${origin}/admin`)
        }
      }

      // Regular user → check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, ranch_name')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Sin nombre'
        const userEmail = data.user.email || ''

        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          email: userEmail,
          status: 'pendiente',
        })

        // Send welcome + admin notification emails (non-blocking)
        sendWelcomeEmails(fullName, userEmail).catch(() => {})

        return NextResponse.redirect(`${origin}/registro`)
      }

      // Existing user with incomplete profile
      if (!existingProfile.ranch_name) {
        return NextResponse.redirect(`${origin}/registro`)
      }

      return NextResponse.redirect(`${origin}/mi-perfil`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}

async function sendWelcomeEmails(fullName: string, email: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  const from = `Regenerando Ando <${process.env.SMTP_USER || 'daniel@regenerandoando.com'}>`
  const adminEmail = process.env.ADMIN_EMAIL || 'daniel@regenerandoando.com'

  // Welcome email to user
  await transporter.sendMail({
    from,
    to: email,
    subject: '🌱 Bienvenido a Regenerando Ando',
    html: emailTemplate(`
      <h1 style="color: #0F6E56; font-size: 24px; margin-bottom: 16px;">¡Bienvenido, ${fullName}!</h1>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Gracias por registrarte en <strong>Regenerando Ando</strong>, el directorio mundial de ganaderos regenerativos.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Tu perfil está ahora <strong>en revisión</strong>. Nuestro equipo lo revisará pronto y te avisaremos cuando esté publicado.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://www.regenerandoando.com/mi-perfil" style="background-color: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Ir a mi perfil
        </a>
      </div>
    `),
  })

  // Notification to admin
  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `📋 Nuevo registro: ${fullName}`,
    html: emailTemplate(`
      <h1 style="color: #0F6E56; font-size: 24px; margin-bottom: 16px;">Nuevo ganadero registrado</h1>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Nombre:</strong> ${fullName}</p>
        <p style="margin: 0; font-size: 15px;"><strong>Email:</strong> ${email}</p>
      </div>
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://www.regenerandoando.com/admin/perfiles" style="background-color: #0F6E56; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
          Revisar en el panel
        </a>
      </div>
    `),
  })
}

function emailTemplate(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F3F4F6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:40px 20px;">
<div style="text-align:center;margin-bottom:32px;"><span style="font-size:24px;font-weight:700;"><span style="color:#111;">regenerando</span><span style="color:#1D9E75;">ando</span></span></div>
<div style="background-color:white;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">${content}</div>
<div style="text-align:center;margin-top:32px;color:#9CA3AF;font-size:12px;line-height:1.6;">
<p style="margin:0;">Regenerando Ando — El directorio mundial de ganaderos regenerativos</p>
<p style="margin:4px 0 0 0;"><a href="https://www.regenerandoando.com" style="color:#0F6E56;text-decoration:none;">regenerandoando.com</a></p>
</div></div></body></html>`
}
