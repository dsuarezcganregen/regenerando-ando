import { createClient } from '@/lib/supabase/server'
import StatsCounter from '@/components/StatsCounter'
import DashboardClient from './DashboardClient'

const countryNames: Record<string, string> = {
  MX:'México',CO:'Colombia',AR:'Argentina',EC:'Ecuador',CR:'Costa Rica',UY:'Uruguay',
  ES:'España',BO:'Bolivia',GT:'Guatemala',VE:'Venezuela',PY:'Paraguay',CL:'Chile',
  PA:'Panamá',HN:'Honduras',PE:'Perú',NI:'Nicaragua',BR:'Brasil',US:'Estados Unidos',
  SV:'El Salvador',PT:'Portugal',ZA:'Sudáfrica',DO:'Rep. Dominicana',CU:'Cuba',
  AU:'Australia',NZ:'Nueva Zelanda',KE:'Kenia',FR:'Francia',CA:'Canadá',
  DE:'Alemania',GB:'Reino Unido',IT:'Italia',IN:'India',CN:'China',
}
const systemLabels: Record<string, string> = {
  prv:'PRV',manejo_holistico:'Manejo Holístico',puad:'PUAD',
  silvopastoril:'Silvopastoril',stre:'STRE',pastoreo_racional:'Pastoreo Racional',otro:'Otro',
}
const ecosystemLabels: Record<string, string> = {
  bosque_tropical_humedo:'Bosque tropical húmedo',bosque_tropical_seco:'Bosque tropical seco',
  bosque_templado:'Bosque templado',pastizal:'Pastizal',sabana:'Sabana',
  matorral_xerofilo:'Semiárido',semidesierto:'Semiárido',
  sistema_agroforestal:'Sistema agroforestal',humedal:'Humedal',otro:'Otro',
}

export const metadata = {
  title: 'Dashboard — Regenerando Ando',
  description: 'Estadísticas y resultados de ganadería regenerativa en el mundo.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Section 1: Main counters
  const { data: dashStats } = await supabase.from('dashboard_stats').select('*')
  const totalRanchers = dashStats?.reduce((s, r) => s + (r.total_ranchers || 0), 0) || 0
  const totalHectares = Math.round(dashStats?.reduce((s, r) => s + Number(r.total_hectares || 0), 0) || 0)
  const totalCountries = dashStats?.filter(r => r.total_ranchers > 0).length || 0
  const speciesSet = new Set<string>()
  const { data: speciesData } = await supabase.from('ranch_species').select('species, profile_id, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')
  speciesData?.forEach(s => speciesSet.add(s.species))
  const totalSpecies = speciesSet.size

  // Section 2: Country distribution
  const countryData = (dashStats || [])
    .sort((a, b) => b.total_ranchers - a.total_ranchers)
    .slice(0, 10)
    .map(r => ({ name: countryNames[r.country] || r.country, value: r.total_ranchers }))

  // Map markers
  const { data: mapData } = await supabase.from('map_markers').select('latitude, longitude')
  const mapMarkers = (mapData || []).map(m => ({ lat: m.latitude, lng: m.longitude }))

  // Section 3: Ecosystems
  const { data: ecoData } = await supabase.from('locations').select('ecosystem, profile_id, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('ecosystem', 'is', null)
  const ecoCount: Record<string, number> = {}
  ecoData?.forEach(e => { const label = ecosystemLabels[e.ecosystem] || 'Otro'; ecoCount[label] = (ecoCount[label] || 0) + 1 })
  const ecosystemData = Object.entries(ecoCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const { data: altData } = await supabase.from('locations').select('altitude_masl, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('altitude_masl', 'is', null)
  const altitudes = altData?.map(a => a.altitude_masl).filter(Boolean) || []
  const altMin = altitudes.length > 0 ? Math.min(...altitudes) : null
  const altMax = altitudes.length > 0 ? Math.max(...altitudes) : null

  const { data: precData } = await supabase.from('locations').select('annual_precipitation_mm, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('annual_precipitation_mm', 'is', null)
  const precips = precData?.map(p => p.annual_precipitation_mm).filter(Boolean) || []
  const precMin = precips.length > 0 ? Math.min(...precips) : null
  const precMax = precips.length > 0 ? Math.max(...precips) : null

  // Section 4: Systems
  const { data: sysData } = await supabase.from('operations').select('primary_system, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('primary_system', 'is', null)
  const sysCount: Record<string, number> = {}
  sysData?.forEach(s => { const label = systemLabels[s.primary_system] || s.primary_system; sysCount[label] = (sysCount[label] || 0) + 1 })
  const systemData = Object.entries(sysCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Section 5: Results
  const { data: results } = await supabase.from('results_summary').select('*').single()

  const { data: envAll } = await supabase.from('results_environmental').select('*, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')
  const envCount = envAll?.length || 1

  const soilImproved = envAll?.filter(e => e.soil_coverage === 'mejorado').length || 0
  const erosionReduced = envAll?.filter(e => e.erosion_reduced).length || 0
  const organicImproved = envAll?.filter(e => e.organic_matter_improved).length || 0
  const hasSoilAnalysis = envAll?.filter(e => e.has_soil_analysis).length || 0
  const wildlifeUp = envAll?.filter(e => e.wildlife_increase).length || 0
  const bioNotable = envAll?.filter(e => e.biodiversity_overall === 'mejora_notable').length || 0
  const forageUp = envAll?.filter(e => e.forage_diversity === 'mejorado').length || 0
  const zeroAgrochem = envAll?.filter(e => e.agrochemical_reduction_pct && e.agrochemical_reduction_pct >= 1).length || 0

  const { data: econAll } = await supabase.from('results_economic').select('*, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')
  const econCount = econAll?.length || 1

  const financialUp = econAll?.filter(e => e.financial_position_improved).length || 0
  const profitBetter = econAll?.filter(e => e.profitability === 'mejor').length || 0
  const workSimple = econAll?.filter(e => e.work_dynamics === 'simplificado').length || 0
  const parasiteBetter = econAll?.filter(e => e.parasite_situation === 'mejor').length || 0
  const wouldNotElim = econAll?.filter(e => !e.would_eliminate_regen).length || 0
  const wouldRecommend = econAll?.filter(e => e.would_recommend).length || 0

  // Section 6: Expandable
  const { data: allProfiles } = await supabase.from('profiles').select('created_at, offers_courses, status')
    .eq('status', 'aprobado')
  const withCourses = allProfiles?.filter(p => p.offers_courses).length || 0

  const { data: opAll } = await supabase.from('operations').select('total_hectares, business_type, year_started_regen, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')

  // Business type distribution
  const bizCount: Record<string, number> = {}
  const bizLabels: Record<string, string> = {
    cria:'Cría',desarrollo:'Desarrollo',engorda:'Engorda',doble_proposito:'Doble propósito',
    lecheria_especializada:'Lechería',cria_desarrollo_engorda:'Cría+Desarrollo+Engorda',otro:'Otro',
  }
  opAll?.forEach(o => { if (o.business_type) { const l = bizLabels[o.business_type] || o.business_type; bizCount[l] = (bizCount[l] || 0) + 1 } })
  const bizData = Object.entries(bizCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Average years regenerative
  const yearsRegen = opAll?.filter(o => o.year_started_regen).map(o => new Date().getFullYear() - o.year_started_regen) || []
  const avgYearsRegen = yearsRegen.length > 0 ? Math.round(yearsRegen.reduce((a, b) => a + b, 0) / yearsRegen.length) : 0

  // Size distribution
  const sizeRanges = [
    { name: '1-10 ha', min: 1, max: 10 },{ name: '11-50 ha', min: 11, max: 50 },
    { name: '51-100 ha', min: 51, max: 100 },{ name: '101-500 ha', min: 101, max: 500 },
    { name: '501-1000 ha', min: 501, max: 1000 },{ name: '1000+ ha', min: 1001, max: 999999 },
  ]
  const sizeData = sizeRanges.map(r => ({
    name: r.name,
    value: opAll?.filter(o => o.total_hectares && Number(o.total_hectares) >= r.min && Number(o.total_hectares) <= r.max).length || 0,
  })).filter(d => d.value > 0)

  // Growth by month
  const monthCounts: Record<string, number> = {}
  allProfiles?.forEach(p => {
    const d = new Date(p.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthCounts[key] = (monthCounts[key] || 0) + 1
  })
  const sortedMonths = Object.keys(monthCounts).sort()
  let cumulative = 0
  const growthData = sortedMonths.map(m => {
    cumulative += monthCounts[m]
    return { month: m, total: cumulative }
  })

  const totalWithResults = envAll?.length || 0
  const statsItems = [
    { label: 'Ganaderos registrados', value: totalRanchers },
    { label: 'Países representados', value: totalCountries },
    { label: 'Especies manejadas', value: totalSpecies },
    { label: 'Con resultados documentados', value: totalWithResults },
  ]

  const pct = (n: number, total: number) => total > 0 ? Math.round((n / total) * 100) : 0

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-hero-bg py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Dashboard de ganadería regenerativa</h1>
          <p className="text-gray-500 text-center">Datos en tiempo real del movimiento global</p>
        </div>
      </div>

      {/* Section 1: Counters */}
      <StatsCounter stats={statsItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* Section 2: Geography */}
        <section>
          <SectionTitle>Distribución geográfica</SectionTitle>
          <DashboardClient
            countryData={countryData}
            mapMarkers={mapMarkers}
            ecosystemData={ecosystemData}
            systemData={systemData}
            bizData={bizData}
            sizeData={sizeData}
            growthData={growthData}
            altMin={altMin} altMax={altMax}
            precMin={precMin} precMax={precMax}
            avgYearsRegen={avgYearsRegen}
            withCourses={withCourses}
            totalRanchers={totalRanchers}
            envCount={envCount}
            results={{
              capacityBefore: results?.avg_capacity_before,
              capacityAfter: results?.avg_capacity_after,
              capacityPct: results?.capacity_increase_pct,
              soilPct: pct(soilImproved, envCount),
              erosionPct: pct(erosionReduced, envCount),
              organicPct: hasSoilAnalysis > 0 ? pct(organicImproved, hasSoilAnalysis) : null,
              wildlifePct: pct(wildlifeUp, envCount),
              bioPct: pct(bioNotable, envCount),
              foragePct: pct(forageUp, envCount),
              agrochemAvg: results?.avg_agrochem_reduction_pct ? Math.round(Number(results.avg_agrochem_reduction_pct)) : 0,
              agrochemZeroPct: pct(zeroAgrochem, envCount),
              financialPct: pct(financialUp, econCount),
              profitPct: pct(profitBetter, econCount),
              workPct: pct(workSimple, econCount),
              parasitePct: pct(parasiteBetter, econCount),
              wouldNotElimPct: pct(wouldNotElim, econCount),
              wouldRecommendPct: pct(wouldRecommend, econCount),
            }}
          />
        </section>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-gray-900 mb-6">{children}</h2>
}
