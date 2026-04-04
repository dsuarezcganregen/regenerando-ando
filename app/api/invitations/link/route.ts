import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// POST: link a registration to an invitation code
export async function POST(request: NextRequest) {
  try {
    const { refCode, profileId } = await request.json()
    if (!refCode || !profileId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Find the invitation
    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('id, invited_by')
      .eq('invitation_code', refCode)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
    }

    // Update profile with invited_by
    await supabaseAdmin
      .from('profiles')
      .update({ invited_by: invitation.invited_by })
      .eq('id', profileId)

    // Update invitation status
    await supabaseAdmin
      .from('invitations')
      .update({
        status: 'registered',
        registered_profile_id: profileId,
        registered_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
