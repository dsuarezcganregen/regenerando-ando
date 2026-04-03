import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileList from './ProfileList'

export const metadata = { title: 'Perfiles — Admin — Regenerando Ando' }

export default async function PendientesPage(props: { searchParams: Promise<{ status?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
  if (!admin) redirect('/')

  const status = searchParams.status || 'pendiente'

  const { data: profiles } = await supabase
    .from('admin_pending_reviews')
    .select('*')
    .eq('status', status)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Perfiles {status === 'pendiente' ? 'pendientes' : status === 'aprobado' ? 'aprobados' : 'rechazados'}
          </h1>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-primary">&larr; Admin</Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {['pendiente', 'aprobado', 'rechazado'].map((s) => (
            <Link key={s} href={`/admin/pendientes?status=${s}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}s
            </Link>
          ))}
        </div>

        {profiles && profiles.length > 0 ? (
          <ProfileList profiles={profiles} currentStatus={status} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay perfiles {status === 'pendiente' ? 'pendientes' : status === 'aprobado' ? 'aprobados' : 'rechazados'}.
          </div>
        )}
      </div>
    </div>
  )
}
