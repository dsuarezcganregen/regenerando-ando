import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from './AdminSidebar'

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
    .select('id, name, role')
    .eq('user_id', user.id)
    .single()

  if (!admin) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar adminName={admin.name} adminRole={admin.role} userId={user.id} />
      <div className="md:ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
