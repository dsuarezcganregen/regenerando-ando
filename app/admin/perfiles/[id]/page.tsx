import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminProfileActions from './AdminProfileActions'

const countryNames: Record<string, string> = {
  MX: 'México', CO: 'Colombia', AR: 'Argentina', EC: 'Ecuador', CR: 'Costa Rica',
  UY: 'Uruguay', ES: 'España', BO: 'Bolivia', GT: 'Guatemala', VE: 'Venezuela',
  PY: 'Paraguay', CL: 'Chile', PA: 'Panamá', HN: 'Honduras', PE: 'Perú',
  NI: 'Nicaragua', BR: 'Brasil', US: 'Estados Unidos', SV: 'El Salvador',
  PT: 'Portugal', ZA: 'Sudáfrica', DO: 'Rep. Dominicana', CU: 'Cuba',
  AU: 'Australia', NZ: 'Nueva Zelanda', KE: 'Kenia', FR: 'Francia',
}
const systemLabels: Record<string, string> = {
  prv: 'PRV', manejo_holistico: 'Manejo Holístico', puad: 'PUAD',
  silvopastoril: 'Silvopastoril', stre: 'STRE', pastoreo_racional: 'Pastoreo Racional', otro: 'Otro',
}

export default async function AdminPerfilPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user!.id).single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, locations(*), operations(*), ranch_species(*), products(*), management_practices(*), results_environmental(*), results_economic(*), photos(*)')
    .eq('id', id)
    .single()

  if (!profile) redirect('/admin/perfiles')

  const { data: experience } = await supabase.from('rancher_experience').select('*').eq('profile_id', id).single()
  const { data: references } = await supabase.from('rancher_references').select('*').eq('profile_id', id).order('reference_number')
  const { data: noRefExplanation } = await supabase.from('no_references_explanation').select('*').eq('profile_id', id).single()

  const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
  const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
  const species = profile.ranch_species || []
  const products = profile.products || []
  const envResults = profile.results_environmental || []
  const econResults = profile.results_economic || []
  const role = admin?.role || 'editor'

  const statusColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    aprobado: 'bg-green-100 text-green-800 border-green-200',
    rechazado: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Revisar perfil</h1>
        <div className="flex gap-2">
          {(role === 'super_admin' || role === 'moderador' || role === 'editor') && (
            <>
              <Link href={`/admin/perfiles/${id}/editar`} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Editar
              </Link>
              <Link href={`/admin/perfiles/${id}/datos`} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
                Datos crudos
              </Link>
            </>
          )}
          <Link href="/admin/perfiles" className="text-sm text-gray-500 hover:text-primary py-2">&larr; Volver</Link>
        </div>
      </div>

      {/* Status */}
      <div className={`mb-6 px-4 py-3 rounded-xl border ${statusColors[profile.status] || ''}`}>
        Estado: <strong>{profile.status}</strong>
        {profile.rejection_reason && <span> — {profile.rejection_reason}</span>}
        {profile.is_featured && <span className="ml-2">⭐ Destacado</span>}
      </div>

      {/* Datos personales */}
      <Section title="Datos personales">
        <Grid>
          <Info label="Nombre" value={profile.full_name} />
          <Info label="Rancho" value={profile.ranch_name} />
          <Info label="Email" value={profile.email} />
          <Info label="Teléfono" value={profile.phone ? `${profile.phone_country_code || ''} ${profile.phone}` : null} />
          <Info label="Web" value={profile.website} />
          <Info label="Instagram" value={profile.instagram} />
          <Info label="Facebook" value={profile.facebook} />
          <Info label="YouTube" value={profile.youtube} />
          <Info label="TikTok" value={profile.tiktok} />
          <Info label="Ofrece cursos" value={profile.offers_courses ? 'Sí' : 'No'} />
        </Grid>
        {profile.description && (
          <div className="mt-3">
            <span className="text-sm text-gray-500">Descripción:</span>
            <p className="text-sm text-gray-900 mt-1">{profile.description}</p>
          </div>
        )}
      </Section>

      {/* Ubicación */}
      {loc && (
        <Section title="Ubicación">
          <Grid>
            <Info label="País" value={countryNames[loc.country] || loc.country} />
            <Info label="Estado" value={loc.state_province} />
            <Info label="Municipio" value={loc.municipality} />
            <Info label="Ecosistema" value={loc.ecosystem?.replace(/_/g, ' ')} />
            <Info label="Coordenadas" value={loc.latitude && loc.longitude ? `${loc.latitude}, ${loc.longitude}` : null} />
            <Info label="Altitud" value={loc.altitude_masl ? `${loc.altitude_masl} msnm` : null} />
          </Grid>
        </Section>
      )}

      {/* Operación */}
      {op && (
        <Section title="Operación">
          <Grid>
            <Info label="Hectáreas" value={op.total_hectares ? `${Number(op.total_hectares).toLocaleString('es-MX')} ha` : null} />
            <Info label="Ha regenerativas" value={op.regenerative_hectares ? `${Number(op.regenerative_hectares).toLocaleString('es-MX')} ha` : null} />
            <Info label="Sistema" value={systemLabels[op.primary_system] || op.primary_system} />
            <Info label="Tipo negocio" value={op.business_type?.replace(/_/g, ' ')} />
            <Info label="Inicio ganadería" value={op.year_started_ranching?.toString()} />
            <Info label="Inicio regenerativo" value={op.year_started_regen?.toString()} />
            <Info label="Asesor" value={op.advisor_name} />
          </Grid>
        </Section>
      )}

      {/* Especies */}
      {species.length > 0 && (
        <Section title="Especies">
          <div className="flex flex-wrap gap-2">
            {species.map((s: any) => (
              <span key={s.id} className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
                {s.species}{s.breeds ? ` (${s.breeds})` : ''}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Productos */}
      {products.length > 0 && (
        <Section title="Productos">
          <div className="flex flex-wrap gap-2">
            {products.map((p: any) => (
              <span key={p.id} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {p.product_type?.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Resultados ambientales */}
      {envResults.length > 0 && (
        <Section title="Resultados ambientales">
          {envResults.map((r: any) => (
            <Grid key={r.id}>
              <Info label="Capacidad carga antes" value={r.carrying_capacity_before?.toString()} />
              <Info label="Capacidad carga después" value={r.carrying_capacity_after?.toString()} />
              <Info label="Cobertura suelo" value={r.soil_coverage?.replace(/_/g, ' ')} />
              <Info label="Erosión reducida" value={r.erosion_reduced ? 'Sí' : 'No'} />
              <Info label="Fauna silvestre" value={r.wildlife_increase ? 'Sí' : 'No'} />
              <Info label="Especies indicadoras" value={r.wildlife_indicator_species} />
            </Grid>
          ))}
        </Section>
      )}

      {/* Resultados económicos */}
      {econResults.length > 0 && (
        <Section title="Resultados económicos">
          {econResults.map((r: any) => (
            <div key={r.id}>
              <Grid>
                <Info label="Producción" value={r.production_change?.replace(/_/g, ' ')} />
                <Info label="Rentabilidad" value={r.profitability} />
                <Info label="Dinámica trabajo" value={r.work_dynamics} />
                <Info label="Posición financiera" value={r.financial_position_improved ? 'Mejorada' : null} />
              </Grid>
              {r.before_after_narrative && (
                <div className="mt-3 bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 italic">&ldquo;{r.before_after_narrative}&rdquo;</p>
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Experience */}
      {experience && (
        <Section title="Experiencia y verificación">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Prácticas y por qué son regenerativas</p>
              <p className="text-sm text-gray-900 mt-1">{experience.practices_description}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Mayor desafío</p>
              <p className="text-sm text-gray-900 mt-1">{experience.biggest_challenge}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Error y aprendizaje</p>
              <p className="text-sm text-gray-900 mt-1">{experience.mistake_learned}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Cambio observado en suelo</p>
              <p className="text-sm text-gray-900 mt-1">{experience.soil_change_observed}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">¿Qué le mostrarías a tu vecino?</p>
              <p className="text-sm text-gray-900 mt-1">{experience.what_would_show_neighbor}</p>
            </div>
          </div>
        </Section>
      )}

      {/* References */}
      <Section title="Referencias">
        {references && references.length > 0 ? (
          <div className="space-y-4">
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{references.length} referencia{references.length !== 1 ? 's' : ''}</span>
            {references.map((ref: any) => (
              <div key={ref.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{ref.reference_name}</p>
                    <p className="text-sm text-gray-600">{ref.reference_contact}</p>
                    <p className="text-sm text-gray-500">Relación: {ref.relationship}</p>
                    {ref.contact_notes && <p className="text-sm text-blue-600 mt-1">Notas: {ref.contact_notes}</p>}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${ref.contacted ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {ref.contacted ? 'Contactado' : 'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : noRefExplanation ? (
          <div>
            <span className="inline-block text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium mb-3">Sin referencias</span>
            <p className="text-sm text-gray-700">{noRefExplanation.how_learned}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Sin información de referencias</p>
        )}
      </Section>

      {/* Actions */}
      <div className="mt-6">
        <AdminProfileActions profileId={profile.id} currentStatus={profile.status} adminRole={role} isFeatured={profile.is_featured || false} profileName={profile.ranch_name || profile.full_name} />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
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
