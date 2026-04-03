import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminActions from './AdminActions'

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

export default async function RevisarPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
  if (!admin) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, locations(*), operations(*), ranch_species(*), products(*)')
    .eq('id', id)
    .single()

  if (!profile) redirect('/admin')

  const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
  const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
  const species = profile.ranch_species || []
  const products = profile.products || []

  const statusColors: Record<string, string> = {
    pendiente: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    aprobado: 'bg-green-50 text-green-800 border-green-200',
    rechazado: 'bg-red-50 text-red-800 border-red-200',
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Revisar perfil</h1>
          <Link href="/admin/pendientes" className="text-sm text-gray-500 hover:text-primary">&larr; Volver</Link>
        </div>

        {/* Status */}
        <div className={`mb-6 px-4 py-3 rounded-xl border ${statusColors[profile.status] || ''}`}>
          Estado: <strong>{profile.status}</strong>
          {profile.rejection_reason && <span> — {profile.rejection_reason}</span>}
          {profile.reviewed_at && (
            <span className="text-xs ml-2">
              (revisado el {new Date(profile.reviewed_at).toLocaleDateString('es-MX')})
            </span>
          )}
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Información del ganadero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Info label="Nombre" value={profile.full_name} />
            <Info label="Rancho" value={profile.ranch_name} />
            <Info label="Email" value={profile.email} />
            <Info label="Teléfono" value={profile.phone ? `${profile.phone_country_code || ''} ${profile.phone}` : null} />
            <Info label="Web" value={profile.website} />
            <Info label="Instagram" value={profile.instagram} />
          </div>
          {profile.description && (
            <div>
              <span className="text-sm text-gray-500">Descripción:</span>
              <p className="text-sm text-gray-900 mt-1">{profile.description}</p>
            </div>
          )}
        </div>

        {/* Location */}
        {loc && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold">Ubicación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="País" value={countryNames[loc.country] || loc.country} />
              <Info label="Estado/Provincia" value={loc.state_province} />
              <Info label="Municipio" value={loc.municipality} />
              <Info label="Ecosistema" value={loc.ecosystem?.replace(/_/g, ' ')} />
              <Info label="Coordenadas" value={loc.latitude && loc.longitude ? `${loc.latitude}, ${loc.longitude}` : null} />
            </div>
          </div>
        )}

        {/* Operation */}
        {op && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold">Operación</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Info label="Hectáreas totales" value={op.total_hectares ? `${Number(op.total_hectares).toLocaleString('es-MX')} ha` : null} />
              <Info label="Ha regenerativas" value={op.regenerative_hectares ? `${Number(op.regenerative_hectares).toLocaleString('es-MX')} ha` : null} />
              <Info label="Cabezas" value={op.head_count?.toString()} />
              <Info label="Sistema" value={systemLabels[op.primary_system] || op.primary_system} />
              <Info label="Años ganadería" value={op.years_ranching?.toString()} />
              <Info label="Años regenerativo" value={op.years_regenerative?.toString()} />
            </div>
          </div>
        )}

        {/* Species & Products */}
        {species.length > 0 && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-3">Especies</h2>
            <div className="flex flex-wrap gap-2">
              {species.map((s: any) => (
                <span key={s.id} className="text-sm bg-hero-bg text-primary px-3 py-1 rounded-full">
                  {s.species}{s.breeds ? ` (${s.breeds})` : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Admin actions */}
        <div className="mt-6">
          <AdminActions profileId={profile.id} currentStatus={profile.status} />
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <span className="text-sm text-gray-500">{label}: </span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  )
}
