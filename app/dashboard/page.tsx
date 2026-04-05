import { createClient } from '@/lib/supabase/server'
import DashboardNarrative from './DashboardNarrative'

const countryNames: Record<string, string> = {
  MX:'México',CO:'Colombia',AR:'Argentina',EC:'Ecuador',CR:'Costa Rica',UY:'Uruguay',
  ES:'España',BO:'Bolivia',GT:'Guatemala',VE:'Venezuela',PY:'Paraguay',CL:'Chile',
  PA:'Panamá',HN:'Honduras',PE:'Perú',NI:'Nicaragua',BR:'Brasil',US:'Estados Unidos',
  SV:'El Salvador',PT:'Portugal',ZA:'Sudáfrica',DO:'Rep. Dominicana',CU:'Cuba',
  AU:'Australia',NZ:'Nueva Zelanda',KE:'Kenia',FR:'Francia',CA:'Canadá',
  DE:'Alemania',GB:'Reino Unido',IT:'Italia',IN:'India',CN:'China',
}
const countryFlags: Record<string, string> = {
  MX:'🇲🇽',CO:'🇨🇴',AR:'🇦🇷',EC:'🇪🇨',CR:'🇨🇷',UY:'🇺🇾',ES:'🇪🇸',BO:'🇧🇴',
  GT:'🇬🇹',VE:'🇻🇪',PY:'🇵🇾',CL:'🇨🇱',PA:'🇵🇦',HN:'🇭🇳',PE:'🇵🇪',NI:'🇳🇮',
  BR:'🇧🇷',US:'🇺🇸',SV:'🇸🇻',PT:'🇵🇹',ZA:'🇿🇦',DO:'🇩🇴',CU:'🇨🇺',
  AU:'🇦🇺',NZ:'🇳🇿',KE:'🇰🇪',FR:'🇫🇷',CA:'🇨🇦',DE:'🇩🇪',GB:'🇬🇧',
}
const systemLabels: Record<string, string> = {
  prv:'PRV',manejo_holistico:'Manejo Holístico',puad:'PUAD',
  silvopastoril:'Silvopastoril',stre:'STRE',pastoreo_racional:'Pastoreo Racional',otro:'Otro',
}
const ecosystemLabels: Record<string, string> = {
  bosque_tropical_humedo:'Bosque tropical húmedo',bosque_tropical_seco:'Bosque tropical seco',
  bosque_templado:'Bosque templado',pastizal:'Pastizal',sabana:'Sabana',
  matorral_xerofilo:'Semiárido',semidesierto:'Semiárido',
  sistema_agroforestal:'Sistema agroforestal',humedal:'Humedal',paramo:'Páramo',otro:'Otro',
}
const bizLabels: Record<string, string> = {
  cria:'Cría',desarrollo:'Desarrollo',engorda:'Engorda',doble_proposito:'Doble propósito',
  lecheria_especializada:'Lechería',cria_desarrollo_engorda:'Cría+Desarrollo+Engorda',otro:'Otro',
}

export const metadata = {
  title: 'Dashboard — Regenerando Ando',
  description: 'La ganadería regenerativa no es teoría. Es una realidad global que funciona. Datos de más de 800 ganaderos en 27 países.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Counters
  const { data: dashStats } = await supabase.from('dashboard_stats').select('*')
  const totalRanchers = dashStats?.reduce((s, r) => s + (r.total_ranchers || 0), 0) || 0
  const totalCountries = dashStats?.filter(r => r.total_ranchers > 0).length || 0
  const speciesSet = new Set<string>()
  const { data: speciesData } = await supabase.from('ranch_species').select('species, profile_id, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')
  speciesData?.forEach(s => speciesSet.add(s.species))
  const totalSpecies = speciesSet.size

  // Country distribution
  const countryData = (dashStats || [])
    .filter(r => r.total_ranchers > 0)
    .sort((a, b) => b.total_ranchers - a.total_ranchers)
    .slice(0, 10)
    .map(r => ({ name: countryNames[r.country] || r.country, flag: countryFlags[r.country] || '', value: r.total_ranchers }))

  // Map markers
  const { data: mapData } = await supabase.from('map_markers').select('latitude, longitude, country')
  const mapMarkers = (mapData || []).map(m => ({ lat: m.latitude, lng: m.longitude, country: m.country || '' }))

  // Ecosystems
  const { data: ecoData } = await supabase.from('locations').select('ecosystem, profile_id, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('ecosystem', 'is', null)
  const ecoCount: Record<string, number> = {}
  ecoData?.forEach(e => { const label = ecosystemLabels[e.ecosystem] || 'Otro'; ecoCount[label] = (ecoCount[label] || 0) + 1 })
  const ecosystemData = Object.entries(ecoCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const { data: altData } = await supabase.from('locations').select('altitude_masl, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('altitude_masl', 'is', null)
  // Filter out unreasonable altitudes (>6500 msnm is higher than any point in Latin America)
  const altitudes = (altData?.map(a => a.altitude_masl).filter(Boolean) || []).filter(a => a > 0 && a <= 6500)
  const altMin = altitudes.length > 0 ? Math.min(...altitudes) : 0
  const altMax = altitudes.length > 0 ? Math.max(...altitudes) : 3000

  const { data: precData } = await supabase.from('locations').select('annual_precipitation_mm, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('annual_precipitation_mm', 'is', null)
  // Filter out unreasonable precipitation values (>12000 mm/year is extreme)
  const precips = (precData?.map(p => p.annual_precipitation_mm).filter(Boolean) || []).filter(p => p > 0 && p <= 12000)
  const precMin = precips.length > 0 ? Math.min(...precips) : 200
  const precMax = precips.length > 0 ? Math.max(...precips) : 3000

  // Systems
  const { data: sysData } = await supabase.from('operations').select('primary_system, profiles!inner(status)')
    .eq('profiles.status', 'aprobado').not('primary_system', 'is', null)
  const sysCount: Record<string, number> = {}
  sysData?.forEach(s => { const label = systemLabels[s.primary_system] || s.primary_system; sysCount[label] = (sysCount[label] || 0) + 1 })
  const systemData = Object.entries(sysCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  // Results
  const { data: envAll } = await supabase.from('results_environmental').select('*, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')
  const envCount = envAll?.length || 1

  // Calculate capacity from raw data, excluding null/0
  const validCapacity = envAll?.filter(e =>
    e.carrying_capacity_before != null && e.carrying_capacity_before > 0 &&
    e.carrying_capacity_after != null && e.carrying_capacity_after > 0
  ) || []
  const capacityBefore = validCapacity.length > 0
    ? Math.round(validCapacity.reduce((s, e) => s + Number(e.carrying_capacity_before), 0) / validCapacity.length * 100) / 100
    : null
  const capacityAfter = validCapacity.length > 0
    ? Math.round(validCapacity.reduce((s, e) => s + Number(e.carrying_capacity_after), 0) / validCapacity.length * 100) / 100
    : null
  const capacityPct = capacityBefore && capacityAfter
    ? Math.round(((capacityAfter - capacityBefore) / capacityBefore) * 1000) / 10
    : null
  const capacityCount = validCapacity.length

  // Soil - only count profiles that have soil_coverage set
  const soilTotal = envAll?.filter(e => e.soil_coverage != null).length || 0
  const soilImproved = envAll?.filter(e => e.soil_coverage === 'mejorado').length || 0

  // Erosion - only count profiles that have erosion_reduced set
  const erosionTotal = envAll?.filter(e => e.erosion_reduced != null).length || 0
  const erosionReduced = envAll?.filter(e => e.erosion_reduced === true).length || 0

  // Forage - only count profiles that have forage_diversity set
  const forageTotal = envAll?.filter(e => e.forage_diversity != null).length || 0
  const forageUp = envAll?.filter(e => e.forage_diversity === 'mejorado').length || 0

  // Wildlife - only count profiles that have wildlife_increase set
  const wildlifeTotal = envAll?.filter(e => e.wildlife_increase != null).length || 0
  const wildlifeUp = envAll?.filter(e => e.wildlife_increase === true).length || 0

  const validAgrochem = envAll?.filter(e => e.agrochemical_reduction_pct != null && e.agrochemical_reduction_pct <= 1) || []
  const zeroAgrochem = validAgrochem.filter(e => e.agrochemical_reduction_pct >= 1).length

  const { data: econAll } = await supabase.from('results_economic').select('*, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')
  const econCount = econAll?.length || 1

  // Economic - only count profiles that have each field set
  const profitTotal = econAll?.filter(e => e.profitability != null).length || 0
  const profitBetter = econAll?.filter(e => e.profitability === 'mejor').length || 0

  const workTotal = econAll?.filter(e => e.work_dynamics != null).length || 0
  const workSimple = econAll?.filter(e => e.work_dynamics === 'simplificado').length || 0

  const parasiteTotal = econAll?.filter(e => e.parasite_situation != null).length || 0
  const parasiteBetter = econAll?.filter(e => e.parasite_situation === 'mejor').length || 0

  const wouldNotElim = econAll?.filter(e => !e.would_eliminate_regen).length || 0
  const wouldRecommend = econAll?.filter(e => e.would_recommend).length || 0

  const pct = (n: number, total: number) => total > 0 ? Math.round((n / total) * 100) : 0

  // Expandable data
  const { data: allProfiles } = await supabase.from('profiles').select('created_at, status')
    .eq('status', 'aprobado')
  const { data: opAll } = await supabase.from('operations').select('total_hectares, business_type, year_started_regen, profiles!inner(status)')
    .eq('profiles.status', 'aprobado')

  const bizCount: Record<string, number> = {}
  opAll?.forEach(o => { if (o.business_type) { const l = bizLabels[o.business_type] || o.business_type; bizCount[l] = (bizCount[l] || 0) + 1 } })
  const bizData = Object.entries(bizCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)

  const sizeRanges = [
    { name: '1-10 ha', min: 1, max: 10 },{ name: '11-50 ha', min: 11, max: 50 },
    { name: '51-100 ha', min: 51, max: 100 },{ name: '101-500 ha', min: 101, max: 500 },
    { name: '501-1000 ha', min: 501, max: 1000 },{ name: '1000+ ha', min: 1001, max: 999999 },
  ]
  const sizeData = sizeRanges.map(r => ({
    name: r.name,
    value: opAll?.filter(o => o.total_hectares && Number(o.total_hectares) >= r.min && Number(o.total_hectares) <= r.max).length || 0,
  })).filter(d => d.value > 0)

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

  return (
    <DashboardNarrative
      counters={{ ranchers: totalRanchers, countries: totalCountries, species: totalSpecies, hectares: Math.round(opAll?.reduce((s, o) => s + (Number(o.total_hectares) || 0), 0) || 0) }}
      verdict={{
        wouldNotElimPct: pct(wouldNotElim, econCount),
        wouldRecommendPct: pct(wouldRecommend, econCount),
        totalWithResults: envCount,
      }}
      ecosystems={{
        data: ecosystemData,
        altMin, altMax, precMin, precMax,
      }}
      evidence={{
        capacityBefore,
        capacityAfter,
        capacityPct,
        capacityCount,
        foragePct: pct(forageUp, forageTotal),
        forageCount: forageTotal,
        soilPct: pct(soilImproved, soilTotal),
        soilCount: soilTotal,
        erosionPct: pct(erosionReduced, erosionTotal),
        erosionCount: erosionTotal,
        wildlifePct: pct(wildlifeUp, wildlifeTotal),
        wildlifeCount: wildlifeTotal,
        agrochemZeroPct: validAgrochem.length > 0 ? pct(zeroAgrochem, validAgrochem.length) : 0,
        agrochemCount: validAgrochem.length,
        profitPct: pct(profitBetter, profitTotal),
        profitCount: profitTotal,
        workPct: pct(workSimple, workTotal),
        workCount: workTotal,
        parasitePct: pct(parasiteBetter, parasiteTotal),
        parasiteCount: parasiteTotal,
      }}
      systems={systemData}
      geography={{
        countryData,
        mapMarkers,
        totalRanchers,
      }}
      deepDive={{
        growthData,
        bizData,
        sizeData,
      }}
    />
  )
}
