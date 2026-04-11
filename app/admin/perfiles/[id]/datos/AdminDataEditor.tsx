'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from '@/lib/activity-log'

interface Props {
  profileId: string
  initialLocation: any | null
  initialOperations: any | null
  initialManagement: any | null
  initialEnvResults: any[]
  initialEconResults: any[]
  initialSpecies: any[]
}

export default function AdminDataEditor({
  profileId,
  initialLocation,
  initialOperations,
  initialManagement,
  initialEnvResults,
  initialEconResults,
  initialSpecies,
}: Props) {
  const supabase = createClient()

  return (
    <div className="space-y-6">
      <SpeciesSection
        profileId={profileId}
        initial={initialSpecies}
        supabase={supabase}
      />
      <EnvResultsSection
        profileId={profileId}
        initial={initialEnvResults}
        supabase={supabase}
      />
      <EconResultsSection
        profileId={profileId}
        initial={initialEconResults}
        supabase={supabase}
      />
      <ManagementSection
        profileId={profileId}
        initial={initialManagement}
        supabase={supabase}
      />
      <OperationsSection
        profileId={profileId}
        initial={initialOperations}
        supabase={supabase}
      />
      <LocationSection
        profileId={profileId}
        initial={initialLocation}
        supabase={supabase}
      />
    </div>
  )
}

// ──────────────────────────────────────────────
// Collapsible Section wrapper
// ──────────────────────────────────────────────
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-gray-400 text-xl">{open ? '\u25B2' : '\u25BC'}</span>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}

// ──────────────────────────────────────────────
// Message component
// ──────────────────────────────────────────────
function Message({ msg }: { msg: { type: string; text: string } }) {
  if (!msg.text) return null
  return (
    <div
      className={`mb-4 px-4 py-3 rounded-lg text-sm ${
        msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
      }`}
    >
      {msg.text}
    </div>
  )
}

// ──────────────────────────────────────────────
// Reusable field components
// ──────────────────────────────────────────────
function FieldText({
  label,
  value,
  onChange,
  type = 'text',
  note,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  note?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
      />
      {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
    </div>
  )
}

function FieldTextarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="sm:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
      />
    </div>
  )
}

function FieldCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-primary focus:ring-primary/30"
      />
      {label}
    </label>
  )
}

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm bg-white"
      >
        <option value="">-- Sin valor --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 text-sm"
    >
      {saving ? 'Guardando...' : 'Guardar'}
    </button>
  )
}

// helper
function str(v: any): string {
  if (v === null || v === undefined) return ''
  return String(v)
}
function num(v: any): string {
  if (v === null || v === undefined) return ''
  return String(v)
}
function bool(v: any): boolean {
  return v === true
}
function parseNum(v: string): number | null {
  if (v === '' || v === undefined) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}
function parseNullStr(v: string): string | null {
  return v.trim() === '' ? null : v.trim()
}

// ──────────────────────────────────────────────
// 0. Especies y Razas
// ──────────────────────────────────────────────
const speciesOptions = [
  { value: 'bovino', label: 'Bovino' },{ value: 'bufalino', label: 'Bufalino' },
  { value: 'ovino', label: 'Ovino' },{ value: 'caprino', label: 'Caprino' },
  { value: 'equino', label: 'Equino' },{ value: 'porcino', label: 'Porcino' },
  { value: 'gallinas', label: 'Gallinas' },{ value: 'pollos', label: 'Pollos de engorda' },
  { value: 'abejas', label: 'Abejas' },{ value: 'otro', label: 'Otro' },
]

const breedsBySpeciesMap: Record<string, string[]> = {
  bovino: [
    'Brahman','Nelore','Gyr','Guzerat','Indubrasil','Sardo Negro',
    'Angus','Hereford','Charolais','Simmental','Limousin','Pardo Suizo',
    'Holstein','Jersey','Normando','Montbéliarde',
    'Brangus','Bradford','Braford','Santa Gertrudis','Girolando','F1',
    'Criollo','Romosinuano','Blanco Orejinegro','Costeño con Cuernos','Hartón del Valle',
    'Senepol','Bonsmara','Tuli',
  ],
  bufalino: ['Murrah','Mediterráneo','Jafarabadi','Carabao','Búfalo de río'],
  ovino: ['Dorper','Katahdin','Pelibuey','Blackbelly','Suffolk','Hampshire','Santa Inés','Texel','Merino','Criollo'],
  caprino: ['Boer','Nubia','Saanen','Alpina','Toggenburg','Murciana','LaMancha','Anglo-Nubian','Criollo'],
  equino: ['Cuarto de Milla','Criollo','Paso Fino','Pura Sangre','Appaloosa','Árabe','Percherón'],
  porcino: ['Duroc','Hampshire','Yorkshire','Landrace','Pietrain','Berkshire','Criollo','Pelón Mexicano'],
}

function SpeciesSection({
  profileId,
  initial,
  supabase,
}: {
  profileId: string
  initial: any[]
  supabase: any
}) {
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(
    initial.map((s: any) => s.species)
  )
  const [breedsBySpeciesState, setBreedsBySpeciesState] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {}
    initial.forEach((s: any) => {
      if (s.breeds) {
        const parts = s.breeds.split(',').map((b: string) => b.trim()).filter(Boolean)
        const knownBreeds = breedsBySpeciesMap[s.species] || []
        map[s.species] = parts.filter((b: string) => knownBreeds.includes(b))
      }
    })
    return map
  })
  const [breedOtherBySpecies, setBreedOtherBySpecies] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    initial.forEach((s: any) => {
      if (s.breeds) {
        const parts = s.breeds.split(',').map((b: string) => b.trim()).filter(Boolean)
        const knownBreeds = breedsBySpeciesMap[s.species] || []
        const others = parts.filter((b: string) => !knownBreeds.includes(b))
        if (others.length > 0) map[s.species] = others.join(', ')
      }
    })
    return map
  })

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const toggleSpecies = (sp: string) => {
    setSelectedSpecies(prev =>
      prev.includes(sp) ? prev.filter(s => s !== sp) : [...prev, sp]
    )
  }

  const toggleBreed = (sp: string, breed: string) => {
    setBreedsBySpeciesState(prev => {
      const current = prev[sp] || []
      return { ...prev, [sp]: current.includes(breed) ? current.filter(b => b !== breed) : [...current, breed] }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })

    await supabase.from('ranch_species').delete().eq('profile_id', profileId)

    if (selectedSpecies.length > 0) {
      const rows = selectedSpecies.map(sp => {
        const speciesBreeds = breedsBySpeciesState[sp] || []
        const otherBreed = breedOtherBySpecies[sp] || ''
        const breedsStr = [...speciesBreeds, ...(otherBreed ? [otherBreed] : [])].join(', ')
        return { profile_id: profileId, species: sp, breeds: breedsStr || null }
      })
      const { error } = await supabase.from('ranch_species').insert(rows)
      if (error) {
        setMsg({ type: 'error', text: `Error: ${error.message}` })
        setSaving(false)
        return
      }
    }

    await logAdminAction(supabase, 'editar_especies', profileId, `Especies: ${selectedSpecies.join(', ')}`)
    setMsg({ type: 'success', text: 'Especies y razas guardadas' })
    setSaving(false)
  }

  return (
    <CollapsibleSection title="Especies y razas" defaultOpen>
      <Message msg={msg} />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Especies</label>
        <div className="flex flex-wrap gap-2">
          {speciesOptions.map(opt => (
            <label key={opt.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${selectedSpecies.includes(opt.value) ? 'border-primary bg-green-50 text-primary font-medium' : 'border-gray-200'}`}>
              <input type="checkbox" checked={selectedSpecies.includes(opt.value)} onChange={() => toggleSpecies(opt.value)} className="rounded border-gray-300 text-primary focus:ring-primary" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {selectedSpecies.filter(sp => breedsBySpeciesMap[sp]).map(sp => {
        const speciesLabel = speciesOptions.find(o => o.value === sp)?.label || sp
        const breeds = breedsBySpeciesMap[sp] || []
        const selected = breedsBySpeciesState[sp] || []
        return (
          <div key={sp} className="mb-4 border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Razas de {speciesLabel}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {breeds.map(b => (
                <label key={b} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${selected.includes(b) ? 'border-primary bg-green-50 text-primary' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={selected.includes(b)} onChange={() => toggleBreed(sp, b)} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  {b}
                </label>
              ))}
            </div>
            <div className="mt-2">
              <FieldText
                label="Otra(s) raza(s)"
                value={breedOtherBySpecies[sp] || ''}
                onChange={(v) => setBreedOtherBySpecies(prev => ({ ...prev, [sp]: v }))}
              />
            </div>
          </div>
        )
      })}

      <div className="mt-4">
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
// 1. Resultados Ambientales
// ──────────────────────────────────────────────
function EnvResultsSection({
  profileId,
  initial,
  supabase,
}: {
  profileId: string
  initial: any[]
  supabase: any
}) {
  // Use the first result if exists, else defaults
  const r = initial.length > 0 ? initial[0] : null
  const yearReported = r?.year_reported || null

  const [carryBefore, setCarryBefore] = useState(num(r?.carrying_capacity_before))
  const [carryAfter, setCarryAfter] = useState(num(r?.carrying_capacity_after))
  const [hasSoilAnalysis, setHasSoilAnalysis] = useState(bool(r?.has_soil_analysis))
  const [organicMatter, setOrganicMatter] = useState(bool(r?.organic_matter_improved))
  const [erosionReduced, setErosionReduced] = useState(bool(r?.erosion_reduced))
  const [soilCoverage, setSoilCoverage] = useState(str(r?.soil_coverage))
  const [forageDiversity, setForageDiversity] = useState(str(r?.forage_diversity))
  const [wildlifeIncrease, setWildlifeIncrease] = useState(bool(r?.wildlife_increase))
  const [wildlifeSpecies, setWildlifeSpecies] = useState(str(r?.wildlife_indicator_species))
  const [biodiversity, setBiodiversity] = useState(str(r?.biodiversity_overall))
  // agrochemical stored as 0-1, display as 0-100
  const rawAgroPct = r?.agrochemical_reduction_pct
  const [agroPct, setAgroPct] = useState(rawAgroPct != null ? num(rawAgroPct * 100) : '')
  const [otherInputsReduced, setOtherInputsReduced] = useState(bool(r?.other_inputs_reduced))
  const [otherInputsPct, setOtherInputsPct] = useState(num(r?.other_inputs_reduction_pct))

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })

    const agroPctNum = parseNum(agroPct)
    const data: any = {
      profile_id: profileId,
      year_reported: yearReported,
      carrying_capacity_before: parseNum(carryBefore),
      carrying_capacity_after: parseNum(carryAfter),
      has_soil_analysis: hasSoilAnalysis,
      organic_matter_improved: organicMatter,
      erosion_reduced: erosionReduced,
      soil_coverage: parseNullStr(soilCoverage),
      forage_diversity: parseNullStr(forageDiversity),
      wildlife_increase: wildlifeIncrease,
      wildlife_indicator_species: parseNullStr(wildlifeSpecies),
      biodiversity_overall: parseNullStr(biodiversity),
      agrochemical_reduction_pct: agroPctNum != null ? agroPctNum / 100 : null,
      other_inputs_reduced: otherInputsReduced,
      other_inputs_reduction_pct: parseNum(otherInputsPct),
    }

    const { error } = await supabase
      .from('results_environmental')
      .upsert(data, { onConflict: 'profile_id,year_reported' })

    if (error) {
      setMsg({ type: 'error', text: `Error: ${error.message}` })
    } else {
      await logAdminAction(supabase, 'editar_datos_ambientales', profileId, 'Editados resultados ambientales')
      setMsg({ type: 'success', text: 'Resultados ambientales guardados' })
    }
    setSaving(false)
  }

  return (
    <CollapsibleSection title="Resultados Ambientales" defaultOpen={true}>
      <Message msg={msg} />
      {!r && (
        <p className="text-sm text-yellow-600 mb-4">
          No hay resultados ambientales para este perfil. Si guarda se creara un registro nuevo.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldText label="Capacidad de carga antes (UA/ha)" value={carryBefore} onChange={setCarryBefore} type="number" />
        <FieldText label="Capacidad de carga despues (UA/ha)" value={carryAfter} onChange={setCarryAfter} type="number" />
        <FieldSelect
          label="Cobertura de suelo"
          value={soilCoverage}
          onChange={setSoilCoverage}
          options={[
            { value: 'mejorado', label: 'Mejorado' },
            { value: 'sin_cambios', label: 'Sin cambios' },
            { value: 'empeorado', label: 'Empeorado' },
          ]}
        />
        <FieldSelect
          label="Diversidad forrajera"
          value={forageDiversity}
          onChange={setForageDiversity}
          options={[
            { value: 'mejorado', label: 'Mejorado' },
            { value: 'sin_cambios', label: 'Sin cambios' },
            { value: 'empeorado', label: 'Empeorado' },
          ]}
        />
        <FieldSelect
          label="Biodiversidad general"
          value={biodiversity}
          onChange={setBiodiversity}
          options={[
            { value: 'mejora_notable', label: 'Mejora notable' },
            { value: 'alguna_mejora', label: 'Alguna mejora' },
            { value: 'sin_cambios', label: 'Sin cambios' },
            { value: 'empeoro', label: 'Empeoró' },
          ]}
        />
        <FieldText
          label="Reduccion agroquimicos (%)"
          value={agroPct}
          onChange={setAgroPct}
          type="number"
          note={`Valor en BD: ${rawAgroPct != null ? rawAgroPct : 'null'}. Ingrese porcentaje 0-100`}
        />
        <FieldText label="Especies indicadoras de fauna" value={wildlifeSpecies} onChange={setWildlifeSpecies} />
        <FieldText label="Reduccion otros insumos (%)" value={otherInputsPct} onChange={setOtherInputsPct} type="number" />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <FieldCheckbox label="Analisis de suelo" checked={hasSoilAnalysis} onChange={setHasSoilAnalysis} />
        <FieldCheckbox label="Materia organica mejorada" checked={organicMatter} onChange={setOrganicMatter} />
        <FieldCheckbox label="Erosion reducida" checked={erosionReduced} onChange={setErosionReduced} />
        <FieldCheckbox label="Aumento fauna silvestre" checked={wildlifeIncrease} onChange={setWildlifeIncrease} />
        <FieldCheckbox label="Otros insumos reducidos" checked={otherInputsReduced} onChange={setOtherInputsReduced} />
      </div>
      <div className="mt-6">
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
// 2. Resultados Economicos
// ──────────────────────────────────────────────
function EconResultsSection({
  profileId,
  initial,
  supabase,
}: {
  profileId: string
  initial: any[]
  supabase: any
}) {
  const r = initial.length > 0 ? initial[0] : null
  const yearReported = r?.year_reported || null

  const [productionChange, setProductionChange] = useState(str(r?.production_change))
  const [profitability, setProfitability] = useState(str(r?.profitability))
  const [financialImproved, setFinancialImproved] = useState(bool(r?.financial_position_improved))
  const [parasiteSituation, setParasiteSituation] = useState(str(r?.parasite_situation))
  const [workDynamics, setWorkDynamics] = useState(str(r?.work_dynamics))
  const [wouldEliminate, setWouldEliminate] = useState(bool(r?.would_eliminate_regen))
  const [wouldRecommend, setWouldRecommend] = useState(bool(r?.would_recommend))
  const [narrative, setNarrative] = useState(str(r?.before_after_narrative))

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })

    const data: any = {
      profile_id: profileId,
      year_reported: yearReported,
      production_change: parseNullStr(productionChange),
      profitability: parseNullStr(profitability),
      financial_position_improved: financialImproved,
      parasite_situation: parseNullStr(parasiteSituation),
      work_dynamics: parseNullStr(workDynamics),
      would_eliminate_regen: wouldEliminate,
      would_recommend: wouldRecommend,
      before_after_narrative: parseNullStr(narrative),
    }

    const { error } = await supabase
      .from('results_economic')
      .upsert(data, { onConflict: 'profile_id,year_reported' })

    if (error) {
      setMsg({ type: 'error', text: `Error: ${error.message}` })
    } else {
      await logAdminAction(supabase, 'editar_datos_economicos', profileId, 'Editados resultados economicos')
      setMsg({ type: 'success', text: 'Resultados economicos guardados' })
    }
    setSaving(false)
  }

  return (
    <CollapsibleSection title="Resultados Economicos">
      <Message msg={msg} />
      {!r && (
        <p className="text-sm text-yellow-600 mb-4">
          No hay resultados economicos para este perfil. Si guarda se creara un registro nuevo.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldSelect
          label="Cambio en produccion"
          value={productionChange}
          onChange={setProductionChange}
          options={[
            { value: 'mejorado', label: 'Mejorado' },
            { value: 'sin_cambios', label: 'Sin cambios' },
            { value: 'empeorado', label: 'Empeorado' },
          ]}
        />
        <FieldSelect
          label="Rentabilidad"
          value={profitability}
          onChange={setProfitability}
          options={[
            { value: 'mejor', label: 'Mejor' },
            { value: 'igual', label: 'Igual' },
            { value: 'peor', label: 'Peor' },
          ]}
        />
        <FieldSelect
          label="Situacion parasitaria"
          value={parasiteSituation}
          onChange={setParasiteSituation}
          options={[
            { value: 'mejor', label: 'Mejor' },
            { value: 'igual', label: 'Igual' },
            { value: 'peor', label: 'Peor' },
          ]}
        />
        <FieldSelect
          label="Dinamica de trabajo"
          value={workDynamics}
          onChange={setWorkDynamics}
          options={[
            { value: 'simplificado', label: 'Simplificado' },
            { value: 'igual', label: 'Igual' },
            { value: 'complicado', label: 'Complicado' },
          ]}
        />
        <FieldTextarea label="Narrativa antes/despues" value={narrative} onChange={setNarrative} />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        <FieldCheckbox label="Posicion financiera mejorada" checked={financialImproved} onChange={setFinancialImproved} />
        <FieldCheckbox label="Eliminaria lo regenerativo" checked={wouldEliminate} onChange={setWouldEliminate} />
        <FieldCheckbox label="Recomendaria" checked={wouldRecommend} onChange={setWouldRecommend} />
      </div>
      <div className="mt-6">
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
// 3. Practicas de Manejo
// ──────────────────────────────────────────────
function ManagementSection({
  profileId,
  initial,
  supabase,
}: {
  profileId: string
  initial: any | null
  supabase: any
}) {
  const m = initial || {}

  // Implementadas
  const [pastoreoNoSelectivo, setPastoreoNoSelectivo] = useState(bool(m.pastoreo_no_selectivo))
  const [puad, setPuad] = useState(bool(m.puad))
  const [seleccionGenetica, setSeleccionGenetica] = useState(bool(m.seleccion_genetica))
  const [programacionPartos, setProgramacionPartos] = useState(bool(m.programacion_partos))
  const [pastoreoMultiespecie, setPastoreoMultiespecie] = useState(bool(m.pastoreo_multiespecie))
  const [silvopastoril, setSilvopastoril] = useState(bool(m.silvopastoril))

  // Eliminadas
  const [mecanizacionSuelo, setMecanizacionSuelo] = useState(bool(m.mecanizacion_suelo))
  const [agrotoxicos, setAgrotoxicos] = useState(bool(m.agrotoxicos))
  const [ivermectina, setIvermectina] = useState(bool(m.ivermectina))
  const [usoFuego, setUsoFuego] = useState(bool(m.uso_fuego))
  const [monocultivo, setMonocultivo] = useState(bool(m.monocultivo))
  const [talaDesmonte, setTalaDesmonte] = useState(bool(m.tala_desmonte))

  // Pastoreo numbers
  const [avgOccupation, setAvgOccupation] = useState(num(m.avg_occupation_days))
  const [grazingDensity, setGrazingDensity] = useState(num(m.grazing_density_ua_ha))
  const [paddockMax, setPaddockMax] = useState(num(m.paddock_changes_max))
  const [paddockRegular, setPaddockRegular] = useState(num(m.paddock_changes_regular))

  // Agua
  const [hasWaterSystem, setHasWaterSystem] = useState(bool(m.has_water_system))
  const [waterSource, setWaterSource] = useState(str(m.water_source))
  const [usesIrrigation, setUsesIrrigation] = useState(bool(m.uses_irrigation))

  // Cosecha de agua
  const [keyline, setKeyline] = useState(bool(m.keyline_design))
  const [contourLines, setContourLines] = useState(bool(m.contour_lines))
  const [yeomans, setYeomans] = useState(bool(m.yeomans_subsoil))
  const [reservoirs, setReservoirs] = useState(bool(m.reservoirs))
  const [infiltration, setInfiltration] = useState(bool(m.infiltration_trenches))

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })

    const data: any = {
      profile_id: profileId,
      pastoreo_no_selectivo: pastoreoNoSelectivo,
      puad,
      seleccion_genetica: seleccionGenetica,
      programacion_partos: programacionPartos,
      pastoreo_multiespecie: pastoreoMultiespecie,
      silvopastoril,
      mecanizacion_suelo: mecanizacionSuelo,
      agrotoxicos,
      ivermectina,
      uso_fuego: usoFuego,
      monocultivo,
      tala_desmonte: talaDesmonte,
      avg_occupation_days: parseNum(avgOccupation),
      grazing_density_ua_ha: parseNum(grazingDensity),
      paddock_changes_max: parseNum(paddockMax),
      paddock_changes_regular: parseNum(paddockRegular),
      has_water_system: hasWaterSystem,
      water_source: parseNullStr(waterSource),
      uses_irrigation: usesIrrigation,
      keyline_design: keyline,
      contour_lines: contourLines,
      yeomans_subsoil: yeomans,
      reservoirs,
      infiltration_trenches: infiltration,
    }

    let error
    if (initial) {
      const res = await supabase.from('management_practices').update(data).eq('profile_id', profileId)
      error = res.error
    } else {
      const res = await supabase.from('management_practices').insert({ ...data, profile_id: profileId })
      error = res.error
    }

    if (error) {
      setMsg({ type: 'error', text: `Error: ${error.message}` })
    } else {
      await logAdminAction(supabase, 'editar_practicas_manejo', profileId, 'Editadas practicas de manejo')
      setMsg({ type: 'success', text: 'Practicas de manejo guardadas' })
    }
    setSaving(false)
  }

  return (
    <CollapsibleSection title="Practicas de Manejo">
      <Message msg={msg} />
      {!initial && (
        <p className="text-sm text-yellow-600 mb-4">
          No hay practicas de manejo para este perfil. Si guarda se creara un registro nuevo.
        </p>
      )}

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Practicas implementadas</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
        <FieldCheckbox label="Pastoreo no selectivo" checked={pastoreoNoSelectivo} onChange={setPastoreoNoSelectivo} />
        <FieldCheckbox label="PUAD" checked={puad} onChange={setPuad} />
        <FieldCheckbox label="Seleccion genetica" checked={seleccionGenetica} onChange={setSeleccionGenetica} />
        <FieldCheckbox label="Programacion de partos" checked={programacionPartos} onChange={setProgramacionPartos} />
        <FieldCheckbox label="Pastoreo multiespecie" checked={pastoreoMultiespecie} onChange={setPastoreoMultiespecie} />
        <FieldCheckbox label="Silvopastoril" checked={silvopastoril} onChange={setSilvopastoril} />
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Practicas eliminadas</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
        <FieldCheckbox label="Mecanizacion suelo" checked={mecanizacionSuelo} onChange={setMecanizacionSuelo} />
        <FieldCheckbox label="Agrotoxicos" checked={agrotoxicos} onChange={setAgrotoxicos} />
        <FieldCheckbox label="Ivermectina" checked={ivermectina} onChange={setIvermectina} />
        <FieldCheckbox label="Uso de fuego" checked={usoFuego} onChange={setUsoFuego} />
        <FieldCheckbox label="Monocultivo" checked={monocultivo} onChange={setMonocultivo} />
        <FieldCheckbox label="Tala/desmonte" checked={talaDesmonte} onChange={setTalaDesmonte} />
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pastoreo</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FieldText label="Dias promedio ocupacion" value={avgOccupation} onChange={setAvgOccupation} type="number" />
        <FieldText label="Densidad pastoreo (UA/ha)" value={grazingDensity} onChange={setGrazingDensity} type="number" />
        <FieldText label="Cambios potrero max" value={paddockMax} onChange={setPaddockMax} type="number" />
        <FieldText label="Cambios potrero regular" value={paddockRegular} onChange={setPaddockRegular} type="number" />
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Agua</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <FieldText label="Fuente de agua" value={waterSource} onChange={setWaterSource} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6">
        <FieldCheckbox label="Sistema de agua" checked={hasWaterSystem} onChange={setHasWaterSystem} />
        <FieldCheckbox label="Usa riego" checked={usesIrrigation} onChange={setUsesIrrigation} />
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Cosecha de agua</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
        <FieldCheckbox label="Diseno Keyline" checked={keyline} onChange={setKeyline} />
        <FieldCheckbox label="Curvas de nivel" checked={contourLines} onChange={setContourLines} />
        <FieldCheckbox label="Subsolado Yeomans" checked={yeomans} onChange={setYeomans} />
        <FieldCheckbox label="Reservorios" checked={reservoirs} onChange={setReservoirs} />
        <FieldCheckbox label="Trincheras de infiltracion" checked={infiltration} onChange={setInfiltration} />
      </div>

      <div className="mt-6">
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
// 4. Operacion
// ──────────────────────────────────────────────
function OperationsSection({
  profileId,
  initial,
  supabase,
}: {
  profileId: string
  initial: any | null
  supabase: any
}) {
  const op = initial || {}

  const [totalHectares, setTotalHectares] = useState(num(op.total_hectares))
  const [regenHectares, setRegenHectares] = useState(num(op.regenerative_hectares))
  const [headCount, setHeadCount] = useState(num(op.head_count))
  const [yearStartedRanching, setYearStartedRanching] = useState(num(op.year_started_ranching))
  const [yearStartedRegen, setYearStartedRegen] = useState(num(op.year_started_regen))
  const [primarySystem, setPrimarySystem] = useState(str(op.primary_system))
  const [businessType, setBusinessType] = useState(str(op.business_type))
  const [systems, setSystems] = useState(Array.isArray(op.systems) ? op.systems.join(', ') : str(op.systems))
  const [businessTypes, setBusinessTypes] = useState(Array.isArray(op.business_types) ? op.business_types.join(', ') : str(op.business_types))
  const [generationRanching, setGenerationRanching] = useState(num(op.generation_ranching))
  const [advisorName, setAdvisorName] = useState(str(op.advisor_name))
  const [strategyOther, setStrategyOther] = useState(str(op.strategy_other))

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })

    const systemsArr = systems.trim() ? systems.split(',').map((s: string) => s.trim()).filter(Boolean) : null
    const businessTypesArr = businessTypes.trim() ? businessTypes.split(',').map((s: string) => s.trim()).filter(Boolean) : null

    const data: any = {
      total_hectares: parseNum(totalHectares),
      regenerative_hectares: parseNum(regenHectares),
      head_count: parseNum(headCount),
      year_started_ranching: parseNum(yearStartedRanching),
      year_started_regen: parseNum(yearStartedRegen),
      primary_system: parseNullStr(primarySystem),
      business_type: parseNullStr(businessType),
      systems: systemsArr,
      business_types: businessTypesArr,
      generation_ranching: parseNum(generationRanching),
      advisor_name: parseNullStr(advisorName),
      strategy_other: parseNullStr(strategyOther),
    }

    const { data: existing } = await supabase
      .from('operations')
      .select('id')
      .eq('profile_id', profileId)
      .single()

    let error
    if (existing) {
      const res = await supabase.from('operations').update(data).eq('profile_id', profileId)
      error = res.error
    } else {
      const res = await supabase.from('operations').insert({ ...data, profile_id: profileId })
      error = res.error
    }

    if (error) {
      setMsg({ type: 'error', text: `Error: ${error.message}` })
    } else {
      await logAdminAction(supabase, 'editar_operacion', profileId, 'Editada operacion')
      setMsg({ type: 'success', text: 'Operacion guardada' })
    }
    setSaving(false)
  }

  const systemOptions = [
    { value: 'prv', label: 'PRV' },
    { value: 'manejo_holistico', label: 'Manejo Holistico' },
    { value: 'puad', label: 'PUAD' },
    { value: 'silvopastoril', label: 'Silvopastoril' },
    { value: 'stre', label: 'STRE' },
    { value: 'pastoreo_racional', label: 'Pastoreo Racional' },
    { value: 'otro', label: 'Otro' },
  ]

  const businessOptions = [
    { value: 'cria', label: 'Cria' },
    { value: 'desarrollo', label: 'Desarrollo' },
    { value: 'engorda', label: 'Engorda' },
    { value: 'doble_proposito', label: 'Doble proposito' },
    { value: 'lecheria', label: 'Lecheria' },
    { value: 'ciclo_completo', label: 'Ciclo completo' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <CollapsibleSection title="Operacion">
      <Message msg={msg} />
      {!initial && (
        <p className="text-sm text-yellow-600 mb-4">
          No hay datos de operacion. Si guarda se creara un registro nuevo.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldText label="Hectareas totales" value={totalHectares} onChange={setTotalHectares} type="number" />
        <FieldText label="Hectareas regenerativas" value={regenHectares} onChange={setRegenHectares} type="number" />
        <FieldText label="Cabezas de ganado" value={headCount} onChange={setHeadCount} type="number" />
        <FieldText label="Generacion ganadera" value={generationRanching} onChange={setGenerationRanching} type="number" />
        <FieldText label="Ano inicio ganaderia" value={yearStartedRanching} onChange={setYearStartedRanching} type="number" />
        <FieldText label="Ano inicio regenerativo" value={yearStartedRegen} onChange={setYearStartedRegen} type="number" />
        <FieldSelect label="Sistema principal" value={primarySystem} onChange={setPrimarySystem} options={systemOptions} />
        <FieldSelect label="Tipo de negocio" value={businessType} onChange={setBusinessType} options={businessOptions} />
        <FieldText label="Sistemas (separados por coma)" value={systems} onChange={setSystems} note="Ej: prv, manejo_holistico" />
        <FieldText label="Tipos de negocio (separados por coma)" value={businessTypes} onChange={setBusinessTypes} note="Ej: cria, engorda" />
        <FieldText label="Nombre del asesor" value={advisorName} onChange={setAdvisorName} />
        <FieldText label="Estrategia otra" value={strategyOther} onChange={setStrategyOther} />
      </div>
      <div className="mt-6">
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </CollapsibleSection>
  )
}

// ──────────────────────────────────────────────
// 5. Ubicacion
// ──────────────────────────────────────────────
function LocationSection({
  profileId,
  initial,
  supabase,
}: {
  profileId: string
  initial: any | null
  supabase: any
}) {
  const loc = initial || {}

  const [country, setCountry] = useState(str(loc.country))
  const [stateProvince, setStateProvince] = useState(str(loc.state_province))
  const [municipality, setMunicipality] = useState(str(loc.municipality))
  const [locality, setLocality] = useState(str(loc.locality))
  const [latitude, setLatitude] = useState(num(loc.latitude))
  const [longitude, setLongitude] = useState(num(loc.longitude))
  const [ecosystem, setEcosystem] = useState(str(loc.ecosystem))
  const [altitude, setAltitude] = useState(num(loc.altitude_masl))
  const [precipitation, setPrecipitation] = useState(num(loc.annual_precipitation_mm))
  const [rainDist, setRainDist] = useState(str(loc.rain_distribution))

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const ecosystemOptions = [
    { value: 'bosque_tropical_humedo', label: 'Bosque tropical humedo' },
    { value: 'bosque_tropical_seco', label: 'Bosque tropical seco' },
    { value: 'dehesa', label: 'Dehesa' },
    { value: 'pastizal', label: 'Pastizal' },
    { value: 'sabana', label: 'Sabana' },
    { value: 'matorral', label: 'Matorral' },
    { value: 'bosque_templado', label: 'Bosque templado' },
    { value: 'desierto', label: 'Desierto' },
    { value: 'humedal', label: 'Humedal' },
    { value: 'paramo', label: 'Paramo' },
    { value: 'estepa', label: 'Estepa' },
    { value: 'otro', label: 'Otro' },
  ]

  const handleSave = async () => {
    setSaving(true)
    setMsg({ type: '', text: '' })

    const data: any = {
      country: parseNullStr(country),
      state_province: parseNullStr(stateProvince),
      municipality: parseNullStr(municipality),
      locality: parseNullStr(locality),
      latitude: parseNum(latitude),
      longitude: parseNum(longitude),
      ecosystem: parseNullStr(ecosystem),
      altitude_masl: parseNum(altitude),
      annual_precipitation_mm: parseNum(precipitation),
      rain_distribution: parseNullStr(rainDist),
    }

    const { data: existing } = await supabase
      .from('locations')
      .select('id')
      .eq('profile_id', profileId)
      .single()

    let error
    if (existing) {
      const res = await supabase.from('locations').update(data).eq('profile_id', profileId)
      error = res.error
    } else {
      const res = await supabase.from('locations').insert({ ...data, profile_id: profileId })
      error = res.error
    }

    if (error) {
      setMsg({ type: 'error', text: `Error: ${error.message}` })
    } else {
      await logAdminAction(supabase, 'editar_ubicacion', profileId, 'Editada ubicacion')
      setMsg({ type: 'success', text: 'Ubicacion guardada' })
    }
    setSaving(false)
  }

  return (
    <CollapsibleSection title="Ubicacion">
      <Message msg={msg} />
      {!initial && (
        <p className="text-sm text-yellow-600 mb-4">
          No hay datos de ubicacion. Si guarda se creara un registro nuevo.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldText label="Pais (codigo ISO: MX, CO, AR...)" value={country} onChange={setCountry} />
        <FieldText label="Estado/Provincia" value={stateProvince} onChange={setStateProvince} />
        <FieldText label="Municipio" value={municipality} onChange={setMunicipality} />
        <FieldText label="Localidad" value={locality} onChange={setLocality} />
        <FieldText label="Latitud" value={latitude} onChange={setLatitude} type="number" />
        <FieldText label="Longitud" value={longitude} onChange={setLongitude} type="number" />
        <FieldSelect label="Ecosistema" value={ecosystem} onChange={setEcosystem} options={ecosystemOptions} />
        <FieldText label="Altitud (msnm)" value={altitude} onChange={setAltitude} type="number" />
        <FieldText label="Precipitacion anual (mm)" value={precipitation} onChange={setPrecipitation} type="number" />
        <FieldText label="Distribucion de lluvias" value={rainDist} onChange={setRainDist} />
      </div>
      <div className="mt-6">
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </CollapsibleSection>
  )
}
