'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ExportarPage() {
  const [loading, setLoading] = useState('')
  const supabase = createClient()

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) { alert('No hay datos para exportar'); return }
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val).replace(/"/g, '""')
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
      }).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const flattenProfile = (p: any, anonymous = false) => {
    const loc = p.locations?.[0] || p.locations || {}
    const op = p.operations?.[0] || p.operations || {}
    const speciesList = (p.ranch_species || []).map((s: any) => s.species).join(';')
    const breedsList = (p.ranch_species || []).map((s: any) => s.breeds).filter(Boolean).join(';')
    const productsList = (p.products || []).map((pr: any) => pr.product_type).join(';')
    const systemsJoined = Array.isArray(op.systems) ? op.systems.join(';') : (op.primary_system || '')
    const businessTypesJoined = Array.isArray(op.business_types) ? op.business_types.join(';') : (op.business_type || '')

    const base: any = {}

    if (!anonymous) {
      base.full_name = p.full_name
    }
    base.ranch_name = p.ranch_name
    if (!anonymous) {
      base.slug = p.slug
      base.email = p.email
      base.phone = p.phone
      base.phone_country_code = p.phone_country_code
      base.website = p.website
      base.instagram = p.instagram
      base.facebook = p.facebook
      base.youtube = p.youtube
      base.tiktok = p.tiktok
    }
    base.description = p.description
    base.offers_courses = p.offers_courses
    base.courses_description = p.courses_description
    base.products_description = p.products_description
    base.status = p.status
    base.created_at = p.created_at

    // Location
    base.country = loc.country
    base.state_province = loc.state_province
    base.municipality = loc.municipality
    base.locality = loc.locality
    base.latitude = loc.latitude
    base.longitude = loc.longitude
    base.ecosystem = loc.ecosystem
    base.altitude_masl = loc.altitude_masl
    base.annual_precipitation_mm = loc.annual_precipitation_mm
    base.rain_distribution = loc.rain_distribution

    // Operation
    base.total_hectares = op.total_hectares
    base.regenerative_hectares = op.regenerative_hectares
    base.head_count = op.head_count
    base.primary_system = op.primary_system
    base.systems = systemsJoined
    base.business_type = op.business_type
    base.business_types = businessTypesJoined
    base.year_started_ranching = op.year_started_ranching
    base.year_started_regen = op.year_started_regen
    base.years_ranching = op.years_ranching
    base.years_regenerative = op.years_regenerative
    base.generation_ranching = op.generation_ranching
    base.advisor_name = op.advisor_name
    base.strategy_other = op.strategy_other

    // Species & Products
    base.species = speciesList
    base.breeds = breedsList
    base.products = productsList

    return base
  }

  const fetchFullProfiles = async (country?: string) => {
    let query = supabase
      .from('profiles')
      .select('*, locations(*), operations(*), ranch_species(*), products(*)')
      .eq('status', 'aprobado')

    if (country) {
      query = query.eq('locations.country', country)
    }

    const { data, error } = await query
    if (error) { alert('Error: ' + error.message); return null }

    // When filtering by country via nested filter, profiles without matching location still return
    // Filter them out client-side
    if (country && data) {
      return data.filter((p: any) => {
        const loc = Array.isArray(p.locations) ? p.locations[0] : p.locations
        return loc && loc.country === country
      })
    }
    return data
  }

  // 1. Perfiles completos
  const exportProfiles = async () => {
    setLoading('profiles')
    const data = await fetchFullProfiles()
    if (data && data.length > 0) {
      downloadCSV(data.map((p: any) => flattenProfile(p)), 'perfiles_completos.csv')
    }
    setLoading('')
  }

  // 2. Perfiles por pais
  const exportByCountry = async () => {
    const country = prompt('Codigo de pais (ej: MX, CO, AR):')
    if (!country) return
    const code = country.toUpperCase().trim()
    setLoading('country')
    const data = await fetchFullProfiles(code)
    if (data && data.length > 0) {
      downloadCSV(data.map((p: any) => flattenProfile(p)), `perfiles_${code}.csv`)
    }
    setLoading('')
  }

  // 3. Datos anonimizados
  const exportAnonymized = async () => {
    setLoading('anon')
    const data = await fetchFullProfiles()
    if (data && data.length > 0) {
      downloadCSV(data.map((p: any) => flattenProfile(p, true)), 'datos_anonimizados.csv')
    }
    setLoading('')
  }

  // 4. Resultados ambientales
  const exportEnvironmental = async () => {
    setLoading('env')
    const { data, error } = await supabase
      .from('results_environmental')
      .select('*, profiles!inner(status, ranch_name, full_name)')
      .eq('profiles.status', 'aprobado')

    if (error) { alert('Error: ' + error.message); setLoading(''); return }
    if (data && data.length > 0) {
      const flat = data.map((r: any) => ({
        profile_id: r.profile_id,
        ranch_name: r.profiles?.ranch_name,
        full_name: r.profiles?.full_name,
        year_reported: r.year_reported,
        carrying_capacity_before: r.carrying_capacity_before,
        carrying_capacity_after: r.carrying_capacity_after,
        has_soil_analysis: r.has_soil_analysis,
        organic_matter_improved: r.organic_matter_improved,
        organic_matter_change_pct: r.organic_matter_change_pct,
        erosion_reduced: r.erosion_reduced,
        soil_coverage: r.soil_coverage,
        soil_general_improvement: r.soil_general_improvement,
        forage_diversity: r.forage_diversity,
        wildlife_increase: r.wildlife_increase,
        wildlife_indicator_species: r.wildlife_indicator_species,
        biodiversity_overall: r.biodiversity_overall,
        agrochemical_reduction_pct: r.agrochemical_reduction_pct != null ? (r.agrochemical_reduction_pct * 100) : null,
        other_inputs_reduced: r.other_inputs_reduced,
        other_inputs_reduction_pct: r.other_inputs_reduction_pct != null ? (r.other_inputs_reduction_pct * 100) : null,
      }))
      downloadCSV(flat, 'resultados_ambientales.csv')
    }
    setLoading('')
  }

  // 5. Resultados economicos
  const exportEconomic = async () => {
    setLoading('econ')
    const { data, error } = await supabase
      .from('results_economic')
      .select('*, profiles!inner(status, ranch_name, full_name)')
      .eq('profiles.status', 'aprobado')

    if (error) { alert('Error: ' + error.message); setLoading(''); return }
    if (data && data.length > 0) {
      const flat = data.map((r: any) => ({
        profile_id: r.profile_id,
        ranch_name: r.profiles?.ranch_name,
        full_name: r.profiles?.full_name,
        year_reported: r.year_reported,
        production_change: r.production_change,
        production_change_pct: r.production_change_pct,
        reproduction_improved: r.reproduction_improved,
        profitability: r.profitability,
        profitability_reason: r.profitability_reason,
        financial_position_improved: r.financial_position_improved,
        parasite_situation: r.parasite_situation,
        genetic_changes_impact: r.genetic_changes_impact,
        workforce_change: r.workforce_change,
        workforce_change_reason: r.workforce_change_reason,
        work_dynamics: r.work_dynamics,
        work_load: r.work_load,
        would_eliminate_regen: r.would_eliminate_regen,
        why_would_or_not: r.why_would_or_not,
        would_recommend: r.would_recommend,
        before_after_narrative: r.before_after_narrative,
        additional_comments: r.additional_comments,
      }))
      downloadCSV(flat, 'resultados_economicos.csv')
    }
    setLoading('')
  }

  // 6. Practicas de manejo
  const exportPractices = async () => {
    setLoading('practices')
    const { data, error } = await supabase
      .from('management_practices')
      .select('*, profiles!inner(status, ranch_name)')
      .eq('profiles.status', 'aprobado')

    if (error) { alert('Error: ' + error.message); setLoading(''); return }
    if (data && data.length > 0) {
      const flat = data.map((r: any) => ({
        profile_id: r.profile_id,
        ranch_name: r.profiles?.ranch_name,
        // Practicas implementadas
        pastoreo_no_selectivo: r.pastoreo_no_selectivo,
        puad: r.puad,
        seleccion_genetica: r.seleccion_genetica,
        programacion_partos: r.programacion_partos,
        pastoreo_multiespecie: r.pastoreo_multiespecie,
        silvopastoril: r.silvopastoril,
        suplementacion_ruminal: r.suplementacion_ruminal,
        otras_practicas_implementadas: r.otras_practicas_implementadas,
        // Practicas eliminadas
        mecanizacion_suelo: r.mecanizacion_suelo,
        agrotoxicos: r.agrotoxicos,
        ivermectina: r.ivermectina,
        uso_fuego: r.uso_fuego,
        monocultivo: r.monocultivo,
        tala_desmonte: r.tala_desmonte,
        otras_practicas_eliminadas: r.otras_practicas_eliminadas,
        // Pastoreo
        avg_occupation_days: r.avg_occupation_days,
        grazing_density_ua_ha: r.grazing_density_ua_ha,
        paddock_changes_max: r.paddock_changes_max,
        paddock_changes_regular: r.paddock_changes_regular,
        // Agua
        has_water_system: r.has_water_system,
        water_source: r.water_source,
        uses_irrigation: r.uses_irrigation,
        // Agricultura
        does_agriculture: r.does_agriculture,
        crops: r.crops,
        crop_use: r.crop_use,
        // Cosecha de agua
        keyline_design: r.keyline_design,
        contour_lines: r.contour_lines,
        yeomans_subsoil: r.yeomans_subsoil,
        reservoirs: r.reservoirs,
        infiltration_trenches: r.infiltration_trenches,
        canales_camino: r.canales_camino,
        other_water_harvest: r.other_water_harvest,
        // Diversidad vegetal
        direct_plant_diversity_practices: r.direct_plant_diversity_practices,
        plant_diversity_description: r.plant_diversity_description,
      }))
      downloadCSV(flat, 'practicas_manejo.csv')
    }
    setLoading('')
  }

  // 7. Mega export - todos los datos
  const exportAll = async () => {
    setLoading('all')
    try {
      // Profiles
      const profileData = await fetchFullProfiles()
      if (profileData && profileData.length > 0) {
        downloadCSV(profileData.map((p: any) => flattenProfile(p)), 'mega_perfiles.csv')
      }

      // Environmental results
      const { data: envData } = await supabase
        .from('results_environmental')
        .select('*, profiles!inner(status, ranch_name, full_name)')
        .eq('profiles.status', 'aprobado')

      if (envData && envData.length > 0) {
        const flatEnv = envData.map((r: any) => ({
          profile_id: r.profile_id,
          ranch_name: r.profiles?.ranch_name,
          full_name: r.profiles?.full_name,
          year_reported: r.year_reported,
          carrying_capacity_before: r.carrying_capacity_before,
          carrying_capacity_after: r.carrying_capacity_after,
          has_soil_analysis: r.has_soil_analysis,
          organic_matter_improved: r.organic_matter_improved,
          organic_matter_change_pct: r.organic_matter_change_pct,
          erosion_reduced: r.erosion_reduced,
          soil_coverage: r.soil_coverage,
          soil_general_improvement: r.soil_general_improvement,
          forage_diversity: r.forage_diversity,
          wildlife_increase: r.wildlife_increase,
          wildlife_indicator_species: r.wildlife_indicator_species,
          biodiversity_overall: r.biodiversity_overall,
          agrochemical_reduction_pct: r.agrochemical_reduction_pct != null ? (r.agrochemical_reduction_pct * 100) : null,
          other_inputs_reduced: r.other_inputs_reduced,
          other_inputs_reduction_pct: r.other_inputs_reduction_pct != null ? (r.other_inputs_reduction_pct * 100) : null,
        }))
        downloadCSV(flatEnv, 'mega_resultados_ambientales.csv')
      }

      // Practices
      const { data: practicesData } = await supabase
        .from('management_practices')
        .select('*, profiles!inner(status, ranch_name)')
        .eq('profiles.status', 'aprobado')

      if (practicesData && practicesData.length > 0) {
        const flatPractices = practicesData.map((r: any) => ({
          profile_id: r.profile_id,
          ranch_name: r.profiles?.ranch_name,
          pastoreo_no_selectivo: r.pastoreo_no_selectivo,
          puad: r.puad,
          seleccion_genetica: r.seleccion_genetica,
          programacion_partos: r.programacion_partos,
          pastoreo_multiespecie: r.pastoreo_multiespecie,
          silvopastoril: r.silvopastoril,
          suplementacion_ruminal: r.suplementacion_ruminal,
          otras_practicas_implementadas: r.otras_practicas_implementadas,
          mecanizacion_suelo: r.mecanizacion_suelo,
          agrotoxicos: r.agrotoxicos,
          ivermectina: r.ivermectina,
          uso_fuego: r.uso_fuego,
          monocultivo: r.monocultivo,
          tala_desmonte: r.tala_desmonte,
          otras_practicas_eliminadas: r.otras_practicas_eliminadas,
          avg_occupation_days: r.avg_occupation_days,
          grazing_density_ua_ha: r.grazing_density_ua_ha,
          paddock_changes_max: r.paddock_changes_max,
          paddock_changes_regular: r.paddock_changes_regular,
          has_water_system: r.has_water_system,
          water_source: r.water_source,
          uses_irrigation: r.uses_irrigation,
          does_agriculture: r.does_agriculture,
          crops: r.crops,
          crop_use: r.crop_use,
          keyline_design: r.keyline_design,
          contour_lines: r.contour_lines,
          yeomans_subsoil: r.yeomans_subsoil,
          reservoirs: r.reservoirs,
          infiltration_trenches: r.infiltration_trenches,
          canales_camino: r.canales_camino,
          other_water_harvest: r.other_water_harvest,
          direct_plant_diversity_practices: r.direct_plant_diversity_practices,
          plant_diversity_description: r.plant_diversity_description,
        }))
        downloadCSV(flatPractices, 'mega_practicas_manejo.csv')
      }

      alert('Se descargaron 3 archivos CSV (perfiles, resultados ambientales, practicas).')
    } catch (err: any) {
      alert('Error en mega export: ' + err.message)
    }
    setLoading('')
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Exportar datos</h1>
      <p className="text-gray-500 mb-6">Descarga los datos de Regenerando Ando en formato CSV.</p>

      <div className="space-y-4">
        <ExportCard
          title="Perfiles completos"
          description="Todos los perfiles aprobados con TODOS los campos: datos personales, ubicacion, operacion, especies, productos. Un archivo CSV completo."
          onClick={exportProfiles}
          loading={loading === 'profiles'}
        />

        <ExportCard
          title="Perfiles por pais"
          description="Mismos campos que perfiles completos pero filtrados por codigo de pais (MX, CO, AR, etc)."
          onClick={exportByCountry}
          loading={loading === 'country'}
        />

        <ExportCard
          title="Datos anonimizados"
          description="Sin nombre, email, telefono, redes sociales ni slug. Ideal para investigacion y analisis estadistico."
          onClick={exportAnonymized}
          loading={loading === 'anon'}
        />

        <ExportCard
          title="Resultados ambientales"
          description="Capacidad de carga, suelo, cobertura, biodiversidad, reduccion de agroquimicos. Solo perfiles aprobados con resultados."
          onClick={exportEnvironmental}
          loading={loading === 'env'}
        />

        <ExportCard
          title="Resultados economicos"
          description="Produccion, rentabilidad, dinamica de trabajo, parasitos, narrativa antes/despues. Solo perfiles aprobados con resultados."
          onClick={exportEconomic}
          loading={loading === 'econ'}
        />

        <ExportCard
          title="Practicas de manejo"
          description="Todas las practicas implementadas y eliminadas, pastoreo, agua, agricultura y cosecha de agua. Solo perfiles aprobados."
          onClick={exportPractices}
          loading={loading === 'practices'}
        />

        <ExportCard
          title="Todos los datos (mega export)"
          description="Descarga 3 archivos CSV: perfiles completos, resultados ambientales y practicas de manejo. La exportacion mas completa."
          onClick={exportAll}
          loading={loading === 'all'}
          accent
        />
      </div>
    </div>
  )
}

function ExportCard({ title, description, onClick, loading, accent }: {
  title: string; description: string; onClick: () => void; loading: boolean; accent?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border ${accent ? 'border-primary/30 ring-1 ring-primary/10' : 'border-gray-200'} p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className={`font-semibold ${accent ? 'text-primary' : 'text-gray-900'}`}>{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <button onClick={onClick} disabled={loading}
          className={`${accent ? 'bg-primary/90 hover:bg-primary' : 'bg-primary hover:bg-primary-dark'} text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 shrink-0 min-w-[140px]`}>
          {loading ? 'Exportando...' : 'Descargar CSV'}
        </button>
      </div>
    </div>
  )
}
