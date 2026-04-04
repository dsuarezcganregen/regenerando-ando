import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Admin — Regenerando Ando' }

export default async function AdminPage() {
  const supabase = await createClient()

  const { count: pendientes } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pendiente')
  const { count: aprobados } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'aprobado')
  const { count: rechazados } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'rechazado')

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de administración</h1>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/pendientes?status=pendiente"
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
            <div className="text-3xl font-bold text-yellow-700">{pendientes || 0}</div>
            <p className="text-sm text-yellow-600 mt-1">Pendientes</p>
          </Link>
          <Link href="/admin/pendientes?status=aprobado"
            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
            <div className="text-3xl font-bold text-green-700">{aprobados || 0}</div>
            <p className="text-sm text-green-600 mt-1">Aprobados</p>
          </Link>
          <Link href="/admin/pendientes?status=rechazado"
            className="bg-red-50 border border-red-200 rounded-xl p-6 text-center hover:shadow-md transition-all">
            <div className="text-3xl font-bold text-red-700">{rechazados || 0}</div>
            <p className="text-sm text-red-600 mt-1">Rechazados</p>
          </Link>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/admin/mensajes"
            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-primary hover:text-primary transition-colors"
          >
            💬 Mensajes
          </Link>
          <Link
            href="/admin/pendientes?status=pendiente"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Revisar pendientes &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
