import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user is admin
      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      if (admin) {
        // Admin → go to admin panel, no profile needed
        return NextResponse.redirect(`${origin}/admin`)
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
        return NextResponse.redirect(`${origin}/mi-perfil/editar`)
      }

      // Existing user with incomplete profile
      if (!existingProfile.ranch_name) {
        return NextResponse.redirect(`${origin}/mi-perfil/editar`)
      }

      return NextResponse.redirect(`${origin}/mi-perfil`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`)
}
