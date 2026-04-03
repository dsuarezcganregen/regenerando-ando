import { SupabaseClient } from '@supabase/supabase-js'

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  title: string,
  message: string,
  profileId?: string
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    profile_id: profileId || null,
  })
}

export async function notifyAdmins(
  supabase: SupabaseClient,
  type: string,
  title: string,
  message: string,
  profileId?: string
) {
  const { data: admins } = await supabase.from('admins').select('user_id')
  if (!admins) return

  const notifications = admins.map((admin) => ({
    user_id: admin.user_id,
    type,
    title,
    message,
    profile_id: profileId || null,
  }))

  await supabase.from('notifications').insert(notifications)
}

export async function getUnreadCount(supabase: SupabaseClient, userId: string) {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return count || 0
}

export async function markAsRead(supabase: SupabaseClient, notificationId: string) {
  await supabase.from('notifications').update({ read: true }).eq('id', notificationId)
}

export async function markAllAsRead(supabase: SupabaseClient, userId: string) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}
