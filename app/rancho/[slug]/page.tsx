import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { systemLabels, countryNames, ecosystemLabels } from '@/components/RanchoCard'
import type { Metadata } from 'next'

const businessLabels: Record<string, string> = {
  cria: 'Cría', desarrollo: 'Desarrollo', engorda: 'Engorda',
  cria_desarrollo_engorda: 'Cría + Desarrollo + Engorda',
  doble_proposito: 'Doble propósito', lecheria_especializada: 'Lechería especializada', otro: 'Otro',
}

const speciesLabels: Record<string, string> = {
  bovino: 'Bovino', bufalino: 'Bufalino', ovino: 'Ovino', caprino: 'Caprino',
  equino: 'Equino', porcino: 'Porcino', gallinas: 'Gallinas', pollos: 'Pollos',
  abejas: 'Abejas', otro: 'Otro',
}

async function getRanch(slug: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      locations(*),
      operations(*),
      ranch_species(*),
      products(*),
      management_practices(*),
      results_environmental(*),
      results_economic(*),
      photos(*)
    `)
    .eq('slug', slug)
    .eq('status', 'aprobado')
    .eq('consent_publish', true)
    .single()

  return profile
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params
  const ranch = await getRanch(slug)
  if (!ranch) return { title: 'Rancho no encontrado' }
  return {
    title: `${ranch.ranch_name || ranch.full_name} — Regenerando Ando`,
    description: ranch.description || `Perfil de ${ranch.ranch_name} en Regenerando Ando.`,
  }
}

export default async function RanchoPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const ranch = await getRanch(slug)
  if (!ranch) notFound()

  const location = Array.isArray(ranch.locations) ? ranch.locations[0] : ranch.locations
  const operation = Array.isArray(ranch.operations) ? ranch.operations[0] : ranch.operations
  const practices = Array.isArray(ranch.management_practices) ? ranch.management_practices[0] : ranch.management_practices
  const species = ranch.ranch_species || []
  const products = ranch.products || []
  const envResults = ranch.results_environmental || []
  const econResults = ranch.results_economic || []

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-hero-bg rounded-full flex items-center justify-center text-primary font-bold text-2xl shrink-0 overflow-hidden">
              {ranch.logo_url ? (
                <img src={ranch.logo_url} alt={ranch.ranch_name || ''} className="w-full h-full object-cover" />
              ) : (
                ranch.ranch_name?.[0]?.toUpperCase() || 'R'
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {ranch.ranch_name || 'Sin nombre'}
              </h1>
              <p className="text-gray-500">
                {ranch.full_name}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {location?.country && (
                  <span className="text-sm text-gray-600">
                    📍 {location.state_province && `${location.state_province}, `}
                    {countryNames[location.country] || location.country}
                  </span>
                )}
                {location?.ecosystem && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    {ecosystemLabels[location.ecosystem] || location.ecosystem}
                  </span>
                )}
                {ranch.offers_courses && (
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                    Ofrece cursos
                  </span>
                )}
              </div>
            </div>
          </div>

          {ranch.description && (
            <p className="mt-6 text-gray-700 leading-relaxed">{ranch.description}</p>
          )}
        </div>

        {/* Metrics */}
        {operation && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {operation.total_hectares && (
              <MetricBox label="Hectáreas totales" value={Number(operation.total_hectares).toLocaleString('es-MX')} />
            )}
            {operation.regenerative_hectares && (
              <MetricBox label="Ha regenerativas" value={Number(operation.regenerative_hectares).toLocaleString('es-MX')} />
            )}
            {operation.year_started_regen && (
              <MetricBox label="Años en regenerativo" value={`${new Date().getFullYear() - operation.year_started_regen}`} />
            )}
            {envResults.length > 0 && envResults[0].carrying_capacity_after && (
              <MetricBox label="Capacidad de carga" value={`${envResults[0].carrying_capacity_after} UA/ha`} />
            )}
          </div>
        )}

        {/* Operation details */}
        {operation && (
          <Section title="Operación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {operation.primary_system && (
                <InfoRow label="Sistema" value={systemLabels[operation.primary_system] || operation.primary_system} />
              )}
              {operation.business_type && (
                <InfoRow label="Tipo de negocio" value={businessLabels[operation.business_type] || operation.business_type} />
              )}
              {operation.year_started_ranching && (
                <InfoRow label="Años en ganadería" value={`${new Date().getFullYear() - operation.year_started_ranching} años (desde ${operation.year_started_ranching})`} />
              )}
              {operation.year_started_regen && (
                <InfoRow label="Inicio regenerativo" value={operation.year_started_regen.toString()} />
              )}
              {operation.advisor_name && (
                <InfoRow label="Asesor" value={operation.advisor_name} />
              )}
              {operation.association_name && (
                <InfoRow label="Asociación" value={operation.association_name} />
              )}
            </div>
          </Section>
        )}

        {/* Species */}
        {species.length > 0 && (
          <Section title="Especies">
            <div className="flex flex-wrap gap-2">
              {species.map((s: any) => (
                <span key={s.id} className="bg-hero-bg text-primary px-3 py-1.5 rounded-full text-sm">
                  {speciesLabels[s.species] || s.species}
                  {s.breeds && ` (${s.breeds})`}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <Section title="Productos">
            <div className="flex flex-wrap gap-2">
              {products.map((p: any) => (
                <span key={p.id} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm">
                  {p.product_type?.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Contact */}
        <Section title="Contacto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ranch.show_email !== false && ranch.email && <InfoRow label="Email" value={ranch.email} href={`mailto:${ranch.email}`} />}
            {ranch.show_phone !== false && ranch.phone && <InfoRow label="Teléfono" value={`${ranch.phone_country_code || ''} ${ranch.phone}`} href={`tel:${ranch.phone_country_code || ''}${ranch.phone}`} />}
            {ranch.show_website !== false && ranch.website && <InfoRow label="Web" value={ranch.website} href={ranch.website} />}
            {ranch.show_social !== false && ranch.instagram && <InfoRow label="Instagram" value={`@${ranch.instagram}`} href={`https://instagram.com/${ranch.instagram}`} />}
            {ranch.show_social !== false && ranch.facebook && <InfoRow label="Facebook" value={ranch.facebook} href={`https://facebook.com/${ranch.facebook}`} />}
            {ranch.show_social !== false && ranch.youtube && <InfoRow label="YouTube" value={ranch.youtube} href={ranch.youtube} />}
            {ranch.show_social !== false && ranch.tiktok && <InfoRow label="TikTok" value={`@${ranch.tiktok}`} href={`https://tiktok.com/@${ranch.tiktok}`} />}
          </div>
        </Section>

        {/* Courses */}
        {ranch.offers_courses && ranch.courses_description && (
          <Section title="Cursos y capacitación">
            <p className="text-gray-700">{ranch.courses_description}</p>
          </Section>
        )}

        {/* Environmental results */}
        {envResults.length > 0 && (
          <Section title="Resultados ambientales">
            {envResults.map((r: any) => (
              <div key={r.id} className="space-y-2">
                {r.carrying_capacity_before != null && r.carrying_capacity_after != null && (
                  <InfoRow label="Capacidad de carga" value={`${r.carrying_capacity_before} → ${r.carrying_capacity_after} UA/ha`} />
                )}
                {r.soil_coverage && <InfoRow label="Cobertura de suelo" value={r.soil_coverage.replace(/_/g, ' ')} />}
                {r.forage_diversity && <InfoRow label="Diversidad forrajera" value={r.forage_diversity.replace(/_/g, ' ')} />}
                {r.wildlife_increase && <InfoRow label="Aumento de fauna" value="Sí" />}
                {r.wildlife_indicator_species && <InfoRow label="Especies indicadoras" value={r.wildlife_indicator_species} />}
              </div>
            ))}
          </Section>
        )}

        {/* Economic results */}
        {econResults.length > 0 && (
          <Section title="Resultados económicos">
            {econResults.map((r: any) => (
              <div key={r.id} className="space-y-2">
                {r.production_change && <InfoRow label="Producción" value={r.production_change.replace(/_/g, ' ')} />}
                {r.profitability && <InfoRow label="Rentabilidad" value={r.profitability} />}
                {r.work_dynamics && <InfoRow label="Dinámica de trabajo" value={r.work_dynamics} />}
                {r.before_after_narrative && (
                  <div className="mt-4 bg-hero-bg rounded-lg p-4">
                    <p className="text-sm text-gray-700 italic">&ldquo;{r.before_after_narrative}&rdquo;</p>
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Photo gallery */}
        {ranch.photos && ranch.photos.length > 0 && (
          <Section title="Galería">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ranch.photos.map((photo: any) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Foto del rancho'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Section>
        )}
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

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-xl font-bold text-primary">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}: </span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-sm text-gray-900">{value}</span>
      )}
    </div>
  )
}
