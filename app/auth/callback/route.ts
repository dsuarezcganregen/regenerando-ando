import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Sin nombre',
          email: data.user.email || '',
          status: 'pendiente',
        })
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
