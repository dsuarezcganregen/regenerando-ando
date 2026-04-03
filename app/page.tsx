import Link from "next/link"
import StatsCounter from "@/components/StatsCounter"
import { createClient } from "@/lib/supabase/server"

async function getStats() {
  const supabase = await createClient()

  const { data: dashboardStats } = await supabase
    .from("dashboard_stats")
    .select("total_ranchers, total_hectares, species_count, country")

  if (!dashboardStats || dashboardStats.length === 0) {
    return { ranchers: 0, countries: 0, hectares: 0, species: 0 }
  }

  const ranchers = dashboardStats.reduce((sum, row) => sum + (row.total_ranchers || 0), 0)
  const countries = dashboardStats.length
  const hectares = dashboardStats.reduce((sum, row) => sum + Number(row.total_hectares || 0), 0)
  const speciesSet = new Set<number>()
  dashboardStats.forEach((row) => {
    if (row.species_count) speciesSet.add(row.species_count)
  })

  return { ranchers, countries, hectares: Math.round(hectares), species: speciesSet.size || 0 }
}

async function getFeaturedRanches() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("profiles")
    .select(`
      id, ranch_name, slug, description, logo_url, offers_courses,
      locations(country, state_province, ecosystem),
      operations(total_hectares, primary_system)
    `)
    .eq("status", "aprobado")
    .eq("consent_publish", true)
    .order("created_at", { ascending: false })
    .limit(6)

  return data || []
}

async function getResultsSummary() {
  const supabase = await createClient()
  const { data } = await supabase.from("results_summary").select("*").single()
  return data
}

const systemLabels: Record<string, string> = {
  prv: "PRV",
  manejo_holistico: "Manejo Holístico",
  puad: "PUAD",
  silvopastoril: "Silvopastoril",
  stre: "STRE",
  pastoreo_racional: "Pastoreo Racional",
  otro: "Otro",
}

const countryNames: Record<string, string> = {
  MX: "México", CO: "Colombia", AR: "Argentina", EC: "Ecuador",
  CR: "Costa Rica", UY: "Uruguay", ES: "España", BO: "Bolivia",
  GT: "Guatemala", VE: "Venezuela", PY: "Paraguay", CL: "Chile",
  PA: "Panamá", HN: "Honduras", PE: "Perú", NI: "Nicaragua",
  BR: "Brasil", US: "Estados Unidos", SV: "El Salvador",
  PT: "Portugal", ZA: "Sudáfrica", DO: "Rep. Dominicana",
  CU: "Cuba", AU: "Australia", NZ: "Nueva Zelanda", KE: "Kenia", FR: "Francia",
}

export default async function Home() {
  const [stats, featuredRanches, results] = await Promise.all([
    getStats(),
    getFeaturedRanches(),
    getResultsSummary(),
  ])

  const statsItems = [
    { label: "Ganaderos", value: stats.ranchers },
    { label: "Países", value: stats.countries },
    { label: "Hectáreas", value: stats.hectares, suffix: "+" },
    { label: "Con resultados", value: results?.total_with_results || 0 },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
            El directorio mundial de{" "}
            <span className="text-primary">ganaderos regenerativos</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra, conecta y aprende de ganaderos que están regenerando sus tierras
            en todo el mundo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/directorio"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Explorar directorio
            </Link>
            <Link
              href="/auth/registro"
              className="border-2 border-primary text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Registra tu rancho
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsCounter stats={statsItems} />

      {/* Ranchos destacados */}
      {featuredRanches.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Ranchos destacados
              </h2>
              <p className="mt-2 text-gray-500">
                Conoce a algunos de los ganaderos que están transformando el campo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRanches.map((ranch: any) => {
                const location = Array.isArray(ranch.locations)
                  ? ranch.locations[0]
                  : ranch.locations
                const operation = Array.isArray(ranch.operations)
                  ? ranch.operations[0]
                  : ranch.operations

                return (
                  <Link
                    key={ranch.id}
                    href={`/rancho/${ranch.slug}`}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-hero-bg rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0 overflow-hidden">
                        {ranch.logo_url ? (
                          <img src={ranch.logo_url} alt={ranch.ranch_name || ''} className="w-full h-full object-cover" />
                        ) : (
                          ranch.ranch_name?.[0] || "R"
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {ranch.ranch_name || "Sin nombre"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {location?.state_province && `${location.state_province}, `}
                          {countryNames[location?.country] || location?.country || ""}
                        </p>
                      </div>
                    </div>

                    {ranch.description && (
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                        {ranch.description}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {operation?.primary_system && (
                        <span className="text-xs bg-hero-bg text-primary px-2 py-1 rounded-full">
                          {systemLabels[operation.primary_system] || operation.primary_system}
                        </span>
                      )}
                      {operation?.total_hectares && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {Number(operation.total_hectares).toLocaleString("es-MX")} ha
                        </span>
                      )}
                      {ranch.offers_courses && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
                          Ofrece cursos
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/directorio"
                className="text-primary font-medium hover:underline"
              >
                Ver todos los ganaderos &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Resultados globales */}
      {results && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Resultados globales
              </h2>
              <p className="mt-2 text-gray-500">
                Impacto documentado por ganaderos regenerativos en el mundo
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResultCard
                icon="🌱"
                title="Capacidad de carga"
                value={results.capacity_increase_pct ? `+${results.capacity_increase_pct}%` : "—"}
                description="Incremento promedio en capacidad de carga (UA/ha)"
              />
              <ResultCard
                icon="🌍"
                title="Suelo mejorado"
                value={results.soil_improved_count?.toString() || "0"}
                description="Ganaderos reportan mejora en cobertura de suelo"
              />
              <ResultCard
                icon="🦅"
                title="Biodiversidad"
                value={results.wildlife_increase_count?.toString() || "0"}
                description="Ganaderos reportan aumento de fauna silvestre"
              />
              <ResultCard
                icon="💰"
                title="Rentabilidad"
                value={results.profitability_better_count?.toString() || "0"}
                description="Ganaderos reportan mejor rentabilidad"
              />
              <ResultCard
                icon="⚗️"
                title="Reducción agroquímicos"
                value={results.avg_agrochem_reduction_pct ? `${results.avg_agrochem_reduction_pct}%` : "—"}
                description="Reducción promedio en uso de agroquímicos"
              />
              <ResultCard
                icon="🔄"
                title="No volverían atrás"
                value={results.would_not_eliminate_count?.toString() || "0"}
                description="Ganaderos que no eliminarían lo regenerativo"
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            ¿Eres ganadero regenerativo?
          </h2>
          <p className="mt-3 text-primary-dark text-lg text-white/80">
            Registra tu rancho y forma parte del directorio mundial.
          </p>
          <Link
            href="/auth/registro"
            className="mt-6 inline-block bg-white text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Registrarme gratis
          </Link>
        </div>
      </section>
    </>
  )
}

function ResultCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string
  title: string
  value: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-primary">{value}</div>
      <h3 className="mt-1 font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  )
}
