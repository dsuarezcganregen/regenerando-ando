import { createClient } from '@/lib/supabase/server'

const countryNames: Record<string, string> = {
  MX: 'México', CO: 'Colombia', AR: 'Argentina', EC: 'Ecuador',
  CR: 'Costa Rica', UY: 'Uruguay', ES: 'España', BO: 'Bolivia',
  GT: 'Guatemala', VE: 'Venezuela', PY: 'Paraguay', CL: 'Chile',
  PA: 'Panamá', HN: 'Honduras', PE: 'Perú', NI: 'Nicaragua',
  BR: 'Brasil', US: 'Estados Unidos', SV: 'El Salvador',
  PT: 'Portugal', ZA: 'Sudáfrica', DO: 'Rep. Dominicana',
  CU: 'Cuba', AU: 'Australia', NZ: 'Nueva Zelanda', KE: 'Kenia', FR: 'Francia',
}

async function getDashboardData() {
  const supabase = await createClient()

  const [{ data: stats }, { data: results }] = await Promise.all([
    supabase.from('dashboard_stats').select('*').order('total_ranchers', { ascending: false }),
    supabase.from('results_summary').select('*').single(),
  ])

  const totalRanchers = stats?.reduce((sum, row) => sum + (row.total_ranchers || 0), 0) || 0
  const totalHectares = stats?.reduce((sum, row) => sum + Number(row.total_hectares || 0), 0) || 0
  const totalHead = stats?.reduce((sum, row) => sum + (row.total_head_count || 0), 0) || 0
  const totalCountries = stats?.length || 0

  return { stats: stats || [], results, totalRanchers, totalHectares, totalHead, totalCountries }
}

export const metadata = {
  title: 'Dashboard — Regenerando Ando',
  description: 'Estadísticas de ganadería regenerativa en el mundo.',
}

export default async function DashboardPage() {
  const { stats, results, totalRanchers, totalHectares, totalHead, totalCountries } =
    await getDashboardData()

  const maxRanchers = stats.length > 0 ? stats[0].total_ranchers : 1

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Estadísticas en tiempo real de ganadería regenerativa</p>

        {/* Metric cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Ganaderos" value={totalRanchers.toLocaleString('es-MX')} />
          <MetricCard label="Países" value={totalCountries.toString()} />
          <MetricCard label="Hectáreas" value={totalHectares.toLocaleString('es-MX')} />
          <MetricCard label="Cabezas de ganado" value={totalHead.toLocaleString('es-MX')} />
        </div>

        {/* Country bars */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ganaderos por país</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
            {stats.slice(0, 15).map((row) => (
              <div key={row.country} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-36 shrink-0 truncate">
                  {countryNames[row.country] || row.country}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((row.total_ranchers / maxRanchers) * 100, 5)}%` }}
                  >
                    <span className="text-xs text-white font-medium">{row.total_ranchers}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resultados globales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ResultCard
                icon="🌱"
                title="Capacidad de carga"
                value={results.capacity_increase_pct ? `+${results.capacity_increase_pct}%` : '—'}
                sub="Incremento promedio (UA/ha)"
              />
              <ResultCard
                icon="🌍"
                title="Suelo mejorado"
                value={results.soil_improved_count?.toString() || '0'}
                sub="Ganaderos con mejora en cobertura"
              />
              <ResultCard
                icon="🦅"
                title="Fauna silvestre"
                value={results.wildlife_increase_count?.toString() || '0'}
                sub="Ganaderos con aumento de fauna"
              />
              <ResultCard
                icon="💰"
                title="Mejor rentabilidad"
                value={results.profitability_better_count?.toString() || '0'}
                sub="Ganaderos con mayor ganancia"
              />
              <ResultCard
                icon="⚙️"
                title="Trabajo simplificado"
                value={results.work_simplified_count?.toString() || '0'}
                sub="Ganaderos con dinámicas más simples"
              />
              <ResultCard
                icon="🔄"
                title="No volverían atrás"
                value={results.would_not_eliminate_count?.toString() || '0'}
                sub="Ganaderos que mantienen lo regenerativo"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="text-2xl sm:text-3xl font-bold text-primary">{value}</div>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  )
}

function ResultCard({ icon, title, value, sub }: { icon: string; title: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-primary">{value}</div>
      <h3 className="mt-1 font-semibold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
  )
}
