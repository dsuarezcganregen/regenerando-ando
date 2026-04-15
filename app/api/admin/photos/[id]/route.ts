import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// DELETE: admin deletes any photo (DB record + storage file)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const supabaseAdmin = getSupabaseAdmin()
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Verify the user is an admin
    const { data: adminRow } = await supabaseAdmin
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()
    if (!adminRow) return NextResponse.json({ error: 'Requiere permisos de administrador' }, { status: 403 })

    const { id: photoId } = await params

    // Fetch the photo to get storage_path and profile_id
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('photos')
      .select('id, url, storage_path, profile_id, is_primary')
      .eq('id', photoId)
      .single()
    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Foto no encontrada' }, { status: 404 })
    }

    // Delete the storage file
    const path = photo.storage_path || photo.url?.split('ranch-photos/')[1] || ''
    if (path) {
      await supabaseAdmin.storage.from('ranch-photos').remove([path])
    }

    // Delete the DB record
    const { error: delError } = await supabaseAdmin.from('photos').delete().eq('id', photoId)
    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 })
    }

    // If we deleted the primary photo, promote the next one
    if (photo.is_primary) {
      const { data: remaining } = await supabaseAdmin
        .from('photos')
        .select('id')
        .eq('profile_id', photo.profile_id)
        .order('uploaded_at')
        .limit(1)
      if (remaining && remaining.length > 0) {
        await supabaseAdmin.from('photos').update({ is_primary: true }).eq('id', remaining[0].id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
