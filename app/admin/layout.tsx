import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNavbar from './AdminNavbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase
    .from('admins')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!admin) redirect('/')

  return (
    <>
      <AdminNavbar adminName={admin.name} />
      <main>{children}</main>
    </>
  )
}
