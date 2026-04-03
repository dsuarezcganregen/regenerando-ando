import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export const metadata = {
  title: 'Mi Perfil — Regenerando Ando',
}

export default async function MiPerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      locations(*),
      operations(*)
    `)
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Completa tu perfil</h1>
          <p className="mt-2 text-gray-500">Aún no has registrado tu rancho.</p>
          <Link
            href="/mi-perfil/editar"
            className="mt-4 inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark"
          >
            Completar perfil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status banner */}
        {profile.status === 'pendiente' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Tu perfil está en revisión</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Te avisaremos cuando sea aprobado. Mientras tanto puedes seguir editando tu información.
              </p>
            </div>
          </div>
        )}

        {profile.status === 'rechazado' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="font-semibold text-red-800">Tu perfil fue rechazado</h3>
              {profile.rejection_reason && (
                <p className="text-sm text-red-700 mt-1">
                  Motivo: {profile.rejection_reason}
                </p>
              )}
              <Link
                href="/mi-perfil/editar"
                className="mt-2 inline-block text-sm text-red-800 font-medium hover:underline"
              >
                Editar y reenviar &rarr;
              </Link>
            </div>
          </div>
        )}

        {profile.status === 'aprobado' && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-green-800">Tu perfil está publicado</h3>
              {profile.slug && (
                <Link
                  href={`/rancho/${profile.slug}`}
                  className="text-sm text-green-700 hover:underline"
                >
                  Ver perfil público &rarr;
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Profile summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Mi Perfil</h1>
            <Link
              href="/mi-perfil/editar"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors"
            >
              Editar perfil
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Nombre" value={profile.full_name} />
            <InfoItem label="Rancho" value={profile.ranch_name} />
            <InfoItem label="Email" value={profile.email} />
            <InfoItem label="Teléfono" value={profile.phone ? `${profile.phone_country_code || ''} ${profile.phone}` : null} />

            {(() => {
              const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
              const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
              return (
                <>
                  {loc?.country && <InfoItem label="País" value={loc.country} />}
                  {loc?.state_province && <InfoItem label="Estado/Provincia" value={loc.state_province} />}
                  {op?.total_hectares && <InfoItem label="Hectáreas" value={`${Number(op.total_hectares).toLocaleString('es-MX')} ha`} />}
                </>
              )
            })()}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/mi-perfil/editar"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900">📝 Editar perfil</h3>
            <p className="text-sm text-gray-500 mt-1">Actualiza la información de tu rancho</p>
          </Link>

          <Link
            href="/mi-perfil/resultados"
            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-gray-900">📊 Mis resultados</h3>
            <p className="text-sm text-gray-500 mt-1">Registra los resultados de tu ganadería regenerativa</p>
          </Link>
        </div>

        {/* Logout */}
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

