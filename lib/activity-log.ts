import { SupabaseClient } from '@supabase/supabase-js'

export async function logAdminAction(
  supabase: SupabaseClient,
  action: string,
  targetProfileId?: string | null,
  details?: string | null
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('admin_activity_log').insert({
    admin_user_id: user.id,
    action,
    target_profile_id: targetProfileId || null,
    details: details || null,
  })
}
