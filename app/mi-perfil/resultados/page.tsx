'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResultadosPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [userId, setUserId] = useState<string | null>(null)
  const [hasExisting, setHasExisting] = useState(false)

  // Environmental
  const [capacityBefore, setCapacityBefore] = useState('')
  const [capacityAfter, setCapacityAfter] = useState('')
  const [hasSoilAnalysis, setHasSoilAnalysis] = useState(false)
  const [organicMatter, setOrganicMatter] = useState(false)
  const [erosionReduced, setErosionReduced] = useState(false)
  const [soilCoverage, setSoilCoverage] = useState('')
  const [forageDiversity, setForageDiversity] = useState('')
  const [wildlifeIncrease, setWildlifeIncrease] = useState(false)
  const [wildlifeSpecies, setWildlifeSpecies] = useState('')
  const [biodiversity, setBiodiversity] = useState('')
  const [agrochemReduction, setAgrochemReduction] = useState('')

  // Economic
  const [productionChange, setProductionChange] = useState('')
  const [profitability, setProfitability] = useState('')
  const [financialImproved, setFinancialImproved] = useState(false)
  const [parasiteSituation, setParasiteSituation] = useState('')
  const [workDynamics, setWorkDynamics] = useState('')
  const [wouldEliminate, setWouldEliminate] = useState(false)
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [narrative, setNarrative] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      const { data: envData } = await supabase
        .from('results_environmental')
        .select('*')
        .eq('profile_id', user.id)
        .order('year_reported', { ascending: false })
        .limit(1)
        .single()

      const { data: econData } = await supabase
        .from('results_economic')
        .select('*')
        .eq('profile_id', user.id)
        .order('year_reported', { ascending: false })
        .limit(1)
        .single()

      if (envData) {
        setHasExisting(true)
        setCapacityBefore(envData.carrying_capacity_before?.toString() || '')
        setCapacityAfter(envData.carrying_capacity_after?.toString() || '')
        setHasSoilAnalysis(envData.has_soil_analysis || false)
        setOrganicMatter(envData.organic_matter_improved || false)
        setErosionReduced(envData.erosion_reduced || false)
        setSoilCoverage(envData.soil_coverage || '')
        setForageDiversity(envData.forage_diversity || '')
        setWildlifeIncrease(envData.wildlife_increase || false)
        setWildlifeSpecies(envData.wildlife_indicator_species || '')
        setBiodiversity(envData.biodiversity_overall || '')
        setAgrochemReduction(envData.agrochemical_reduction_pct?.toString() || '')
      }

      if (econData) {
        setProductionChange(econData.production_change || '')
        setProfitability(econData.profitability || '')
        setFinancialImproved(econData.financial_position_improved || false)
        setParasiteSituation(econData.parasite_situation || '')
        setWorkDynamics(econData.work_dynamics || '')
        setWouldEliminate(econData.would_eliminate_regen || false)
        setWouldRecommend(econData.would_recommend ?? true)
        setNarrative(econData.before_after_narrative || '')
      }

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    setMessage({ type: '', text: '' })
    const year = new Date().getFullYear()

    const envData = {
      profile_id: userId,
      year_reported: year,
      carrying_capacity_before: capacityBefore ? parseFloat(capacityBefore) : null,
      carrying_capacity_after: capacityAfter ? parseFloat(capacityAfter) : null,
      has_soil_analysis: hasSoilAnalysis,
      organic_matter_improved: organicMatter,
      erosion_reduced: erosionReduced,
      soil_coverage: soilCoverage || null,
      forage_diversity: forageDiversity || null,
      wildlife_increase: wildlifeIncrease,
      wildlife_indicator_species: wildlifeSpecies || null,
      biodiversity_overall: biodiversity || null,
      agrochemical_reduction_pct: agrochemReduction ? parseFloat(agrochemReduction) : null,
    }

    const econData = {
      profile_id: userId,
      year_reported: year,
      production_change: productionChange || null,
      profitability: profitability || null,
      financial_position_improved: financialImproved,
      parasite_situation: parasiteSituation || null,
      work_dynamics: workDynamics || null,
      would_eliminate_regen: wouldEliminate,
      would_recommend: wouldRecommend,
      before_after_narrative: narrative || null,
    }

    const { error: envError } = await supabase
      .from('results_environmental')
      .upsert(envData, { onConflict: 'profile_id,year_reported' })

    const { error: econError } = await supabase
      .from('results_economic')
      .upsert(econData, { onConflict: 'profile_id,year_reported' })

    if (envError || econError) {
      setMessage({ type: 'error', text: `Error: ${envError?.message || econError?.message}` })
    } else {
      setMessage({ type: 'success', text: 'Resultados guardados correctamente' })
    }

    setSaving(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis Resultados</h1>
          <Link href="/mi-perfil" className="text-sm text-gray-500 hover:text-primary">
            &larr; Volver
          </Link>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Environmental */}
          <Section title="Resultados ambientales">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Capacidad de carga ANTES (UA/ha)" type="number" value={capacityBefore} onChange={setCapacityBefore} />
              <Field label="Capacidad de carga DESPUÉS (UA/ha)" type="number" value={capacityAfter} onChange={setCapacityAfter} />
              <SelectField label="Cobertura de suelo" value={soilCoverage} onChange={setSoilCoverage}
                options={[['mejorado', 'Mejorado'], ['sin_cambios', 'Sin cambios'], ['empeorado', 'Empeorado']]} />
              <SelectField label="Diversidad forrajera" value={forageDiversity} onChange={setForageDiversity}
                options={[['mejorado', 'Mejorado'], ['sin_cambios', 'Sin cambios'], ['empeorado', 'Empeorado']]} />
              <SelectField label="Biodiversidad general" value={biodiversity} onChange={setBiodiversity}
                options={[['mejora_notable', 'Mejora notable'], ['alguna_mejora', 'Alguna mejora'], ['sin_cambios', 'Sin cambios'], ['empeoro', 'Empeoró']]} />
              <Field label="Reducción agroquímicos (%)" type="number" value={agrochemReduction} onChange={setAgrochemReduction} />
            </div>
            <div className="mt-4 space-y-2">
              <Checkbox label="Tiene análisis de suelo" checked={hasSoilAnalysis} onChange={setHasSoilAnalysis} />
              <Checkbox label="Materia orgánica mejorada" checked={organicMatter} onChange={setOrganicMatter} />
              <Checkbox label="Erosión reducida" checked={erosionReduced} onChange={setErosionReduced} />
              <Checkbox label="Aumento de fauna silvestre" checked={wildlifeIncrease} onChange={setWildlifeIncrease} />
            </div>
            {wildlifeIncrease && (
              <div className="mt-3">
                <Field label="Especies indicadoras observadas" value={wildlifeSpecies} onChange={setWildlifeSpecies} />
              </div>
            )}
          </Section>

          {/* Economic */}
          <Section title="Resultados económicos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField label="Cambio en producción" value={productionChange} onChange={setProductionChange}
                options={[['mejorado', 'Mejorado'], ['sin_cambios', 'Sin cambios'], ['empeorado', 'Empeorado']]} />
              <SelectField label="Rentabilidad" value={profitability} onChange={setProfitability}
                options={[['mejor', 'Mejor'], ['igual', 'Igual'], ['peor', 'Peor']]} />
              <SelectField label="Situación de parásitos" value={parasiteSituation} onChange={setParasiteSituation}
                options={[['mejor', 'Mejor'], ['igual', 'Igual'], ['peor', 'Peor']]} />
              <SelectField label="Dinámica de trabajo" value={workDynamics} onChange={setWorkDynamics}
                options={[['simplificado', 'Simplificado'], ['igual', 'Igual'], ['complicado', 'Complicado']]} />
            </div>
            <div className="mt-4 space-y-2">
              <Checkbox label="Posición financiera mejorada" checked={financialImproved} onChange={setFinancialImproved} />
              <Checkbox label="Recomendaría lo regenerativo" checked={wouldRecommend} onChange={setWouldRecommend} />
              <Checkbox label="Eliminaría lo regenerativo" checked={wouldEliminate} onChange={setWouldEliminate} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tu historia: antes y después
              </label>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                rows={4}
                placeholder="Cuéntanos cómo era tu rancho antes y cómo es ahora con ganadería regenerativa..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </Section>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar resultados'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        step={type === 'number' ? 'any' : undefined}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: [string, string][]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
        <option value="">Seleccionar</option>
        {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
      </select>
    </div>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-primary focus:ring-primary" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
