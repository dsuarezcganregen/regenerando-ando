import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import ProfileListAdmin from './ProfileListAdmin'

const PAGE_SIZE = 20

export const metadata = { title: 'Perfiles — Admin — Regenerando Ando' }

export default async function PerfilesPage(props: { searchParams: Promise<{ status?: string; pais?: string; q?: string; page?: string; incomplete?: string; sort?: string; dir?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const status = searchParams.status || ''
  const page = parseInt(searchParams.page || '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  // Get admin role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user!.id).single()

  let query = supabase.from('admin_pending_reviews').select('*', { count: 'exact' })

  if (status) query = query.eq('status', status)
  if (searchParams.pais) query = query.eq('country', searchParams.pais)
  if (searchParams.incomplete === '1') {
    query = query.is('ranch_name', null)
  } else {
    // By default, exclude incomplete profiles (no ranch_name)
    query = query.not('ranch_name', 'is', null)
  }
  if (searchParams.q) {
    const q = searchParams.q
    // Check if the search term matches a country name, convert to code
    const countryNameToCode: Record<string, string> = {
      'méxico': 'MX', 'mexico': 'MX', 'colombia': 'CO', 'argentina': 'AR',
      'ecuador': 'EC', 'costa rica': 'CR', 'uruguay': 'UY', 'españa': 'ES',
      'espana': 'ES', 'bolivia': 'BO', 'guatemala': 'GT', 'venezuela': 'VE',
      'paraguay': 'PY', 'chile': 'CL', 'panamá': 'PA', 'panama': 'PA',
      'honduras': 'HN', 'perú': 'PE', 'peru': 'PE', 'nicaragua': 'NI',
      'brasil': 'BR', 'estados unidos': 'US', 'el salvador': 'SV',
      'portugal': 'PT', 'sudáfrica': 'ZA', 'sudafrica': 'ZA',
      'república dominicana': 'DO', 'dominicana': 'DO', 'cuba': 'CU',
      'australia': 'AU', 'nueva zelanda': 'NZ', 'kenia': 'KE', 'francia': 'FR',
    }
    const countryCode = countryNameToCode[q.toLowerCase()]

    if (countryCode) {
      query = query.or(`full_name.ilike.%${q}%,ranch_name.ilike.%${q}%,email.ilike.%${q}%,country.eq.${countryCode}`)
    } else {
      query = query.or(`full_name.ilike.%${q}%,ranch_name.ilike.%${q}%,email.ilike.%${q}%,country.ilike.%${q}%`)
    }
  }

  // Sorting
  const sortField = searchParams.sort || 'created_at'
  const sortDir = searchParams.dir === 'asc' ? true : false // ascending = true
  const validSortFields = ['ranch_name', 'full_name', 'country', 'primary_system', 'total_hectares', 'status', 'created_at']
  const actualSort = validSortFields.includes(sortField) ? sortField : 'created_at'
  query = query.order(actualSort, { ascending: sortDir, nullsFirst: false })

  query = query.range(from, to)

  const { data: profiles, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  // Get counts for tabs (exclude incomplete profiles without ranch_name)
  const [{ count: cPendiente }, { count: cAprobado }, { count: cRechazado }, { count: cIncompleto }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pendiente').not('ranch_name', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'aprobado'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'rechazado'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).is('ranch_name', null),
  ])

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfiles</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabLink href="/admin/perfiles" label={`Todos (${(cPendiente || 0) + (cAprobado || 0) + (cRechazado || 0)})`} active={!status && searchParams.incomplete !== '1'} />
        <TabLink href="/admin/perfiles?status=pendiente" label={`Pendientes (${cPendiente || 0})`} active={status === 'pendiente'} />
        <TabLink href="/admin/perfiles?status=aprobado" label={`Aprobados (${cAprobado || 0})`} active={status === 'aprobado'} />
        <TabLink href="/admin/perfiles?status=rechazado" label={`Rechazados (${cRechazado || 0})`} active={status === 'rechazado'} />
        {(cIncompleto || 0) > 0 && (
          <TabLink href="/admin/perfiles?incomplete=1" label={`Incompletos (${cIncompleto})`} active={searchParams.incomplete === '1'} />
        )}
      </div>

      <ProfileListAdmin
        profiles={profiles || []}
        currentStatus={status}
        adminRole={admin?.role || 'editor'}
        totalPages={totalPages}
        currentPage={page}
        searchParams={searchParams}
      />
    </div>
  )
}

function TabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
    }`}>
      {label}
    </Link>
  )
}
