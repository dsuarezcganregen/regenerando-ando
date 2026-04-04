import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: validate invitation code (public, no auth required)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabaseAdmin = getSupabaseAdmin()

    const { data: invitation } = await supabaseAdmin
      .from('invitations')
      .select('invited_by')
      .eq('invitation_code', code)
      .single()

    if (!invitation) {
      return NextResponse.json({ valid: false })
    }

    // Get inviter info
    const { data: inviter } = await supabaseAdmin
      .from('profiles')
      .select('full_name, ranch_name')
      .eq('id', invitation.invited_by)
      .single()

    return NextResponse.json({
      valid: true,
      inviterName: inviter?.full_name || '',
      inviterRanch: inviter?.ranch_name || '',
    })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
