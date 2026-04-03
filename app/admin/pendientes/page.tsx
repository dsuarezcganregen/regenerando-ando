import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const countryNames: Record<string, string> = {
  MX: 'México', CO: 'Colombia', AR: 'Argentina', EC: 'Ecuador',
  CR: 'Costa Rica', UY: 'Uruguay', ES: 'España', BO: 'Bolivia',
  GT: 'Guatemala', VE: 'Venezuela', PY: 'Paraguay', CL: 'Chile',
  PA: 'Panamá', HN: 'Honduras', PE: 'Perú', NI: 'Nicaragua',
  BR: 'Brasil', US: 'Estados Unidos', SV: 'El Salvador',
  PT: 'Portugal', ZA: 'Sudáfrica', DO: 'Rep. Dominicana',
  CU: 'Cuba', AU: 'Australia', NZ: 'Nueva Zelanda', KE: 'Kenia', FR: 'Francia',
}

const systemLabels: Record<string, string> = {
  prv: 'PRV', manejo_holistico: 'Manejo Holístico', puad: 'PUAD',
  silvopastoril: 'Silvopastoril', stre: 'STRE', pastoreo_racional: 'Pastoreo Racional', otro: 'Otro',
}

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

  const statusColors: Record<string, string> = {
    pendiente: 'bg-yellow-50 text-yellow-700',
    aprobado: 'bg-green-50 text-green-700',
    rechazado: 'bg-red-50 text-red-700',
  }

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
          <div className="space-y-4">
            {profiles.map((p: any) => (
              <Link key={p.id} href={`/admin/revisar/${p.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{p.ranch_name || p.full_name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {p.full_name} &middot; {countryNames[p.country] || p.country || 'Sin país'}
                      {p.state_province && `, ${p.state_province}`}
                    </p>
                    {p.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {p.primary_system && (
                        <span className="text-xs bg-hero-bg text-primary px-2 py-1 rounded-full">
                          {systemLabels[p.primary_system] || p.primary_system}
                        </span>
                      )}
                      {p.total_hectares && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {Number(p.total_hectares).toLocaleString('es-MX')} ha
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColors[p.status] || ''}`}>
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No hay perfiles {status === 'pendiente' ? 'pendientes' : status === 'aprobado' ? 'aprobados' : 'rechazados'}.
          </div>
        )}
      </div>
    </div>
  )
}
