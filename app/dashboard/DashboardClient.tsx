'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { CountryBars, EcosystemDonut, SystemBars, GrowthLine, SizeBars, ExpandableSection } from '@/components/DashboardCharts'

const DashboardMiniMap = dynamic(() => import('@/components/DashboardMiniMap'), { ssr: false })

interface Props {
  countryData: { name: string; value: number }[]
  mapMarkers: { lat: number; lng: number; country: string }[]
  ecosystemData: { name: string; value: number }[]
  systemData: { name: string; value: number }[]
  bizData: { name: string; value: number }[]
  sizeData: { name: string; value: number }[]
  growthData: { month: string; total: number }[]
  altMin: number | null; altMax: number | null
  precMin: number | null; precMax: number | null
  avgYearsRegen: number
  withCourses: number
  totalRanchers: number
  envCount: number
  results: {
    capacityBefore: number | null; capacityAfter: number | null; capacityPct: number | null
    soilPct: number; erosionPct: number; organicPct: number | null
    wildlifePct: number; bioPct: number; foragePct: number
    agrochemAvg: number; agrochemZeroPct: number
    financialPct: number; profitPct: number; workPct: number; parasitePct: number
    wouldNotElimPct: number; wouldRecommendPct: number
  }
}

export default function DashboardClient(props: Props) {
  const { countryData, mapMarkers, ecosystemData, systemData, results, envCount } = props

  return (
    <div className="space-y-16">
      {/* Section 2: Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ganaderos por país (Top 10)</h3>
          <CountryBars data={countryData} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Distribución global</h3>
          <DashboardMiniMap markers={mapMarkers} />
          <Link href="/mapa" className="text-sm text-primary hover:underline mt-3 inline-block">
            Ver mapa completo &rarr;
          </Link>
        </div>
      </div>

      {/* Section 3: Ecosystems */}
      <Section title="Ecosistemas y diversidad">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {ecosystemData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Distribución por ecosistema</h3>
              <EcosystemDonut data={ecosystemData} />
              <div className="mt-2 space-y-1">
                {ecosystemData.slice(0, 5).map(e => (
                  <div key={e.name} className="flex justify-between text-xs text-gray-600">
                    <span>{e.name}</span><span className="font-medium">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {props.altMin !== null && (
            <MetricBox icon="⛰️" title="Rango de altitud" value={`${props.altMin.toLocaleString('es-MX')} — ${props.altMax!.toLocaleString('es-MX')} msnm`} />
          )}
          {props.precMin !== null && (
            <MetricBox icon="🌧️" title="Rango de precipitación" value={`${props.precMin.toLocaleString('es-MX')} — ${props.precMax!.toLocaleString('es-MX')} mm/año`} />
          )}
        </div>
      </Section>

      {/* Section 4: Systems */}
      <Section title="Estrategias de manejo">
        <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
          <SystemBars data={systemData} />
        </div>
      </Section>

      {/* Section 5: Results */}
      <Section title="Resultados reportados por los ganaderos">
        <p className="text-gray-500 text-sm -mt-4 mb-6">Basado en {envCount} ganaderos que reportaron resultados detallados</p>

        {/* Productivity */}
        {results.capacityBefore && results.capacityAfter && (
          <div className="mb-8">
            <h3 className="font-medium text-gray-800 mb-3">Productividad</h3>
            <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-400">{results.capacityBefore}</p>
                <p className="text-xs text-gray-500">UA/ha antes</p>
              </div>
              <span className="text-2xl text-gray-400">→</span>
              <div>
                <p className="text-3xl font-bold text-primary">{results.capacityAfter}</p>
                <p className="text-xs text-gray-500">UA/ha después</p>
              </div>
              {results.capacityPct && (
                <div className="ml-4 bg-hero-bg rounded-lg px-4 py-2">
                  <p className="text-2xl font-bold text-primary">+{results.capacityPct}%</p>
                  <p className="text-xs text-gray-600">incremento</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Soil */}
        <h3 className="font-medium text-gray-800 mb-3">Suelo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <PctCard value={results.soilPct} label="reporta mejora en cobertura de suelo" />
          <PctCard value={results.erosionPct} label="reporta reducción de erosión" />
          {results.organicPct !== null && <PctCard value={results.organicPct} label="con mejora en materia orgánica" />}
        </div>

        {/* Biodiversity */}
        <h3 className="font-medium text-gray-800 mb-3">Biodiversidad</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <PctCard value={results.wildlifePct} label="reporta aumento de fauna silvestre" />
          <PctCard value={results.bioPct} label="con mejora notable en biodiversidad" />
          <PctCard value={results.foragePct} label="con aumento en diversidad forrajera" />
        </div>

        {/* Inputs */}
        <h3 className="font-medium text-gray-800 mb-3">Insumos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-primary">{results.agrochemAvg}%</p>
            <p className="text-sm text-gray-600 mt-1">reducción promedio de agrotóxicos</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-3xl font-bold text-primary">{results.agrochemZeroPct}%</p>
            <p className="text-sm text-gray-600 mt-1">eliminaron completamente los agrotóxicos</p>
          </div>
        </div>

        {/* Economy */}
        <h3 className="font-medium text-gray-800 mb-3">Economía y trabajo</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <PctCard value={results.financialPct} label="con mejora financiera" />
          <PctCard value={results.profitPct} label="con mejor rentabilidad" />
          <PctCard value={results.workPct} label="simplificó su trabajo" />
          <PctCard value={results.parasitePct} label="mejoró en parásitos" />
        </div>

        {/* The verdict */}
        <div className="bg-hero-bg rounded-xl p-8 text-center space-y-4">
          <h3 className="font-semibold text-gray-800 text-lg">El veredicto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-4xl font-bold text-primary">{results.wouldNotElimPct}%</p>
              <p className="text-sm text-gray-700 mt-1">no eliminaría la ganadería regenerativa de su negocio</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">{results.wouldRecommendPct}%</p>
              <p className="text-sm text-gray-700 mt-1">la recomienda a otros ganaderos</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 6: Expandable */}
      <ExpandableSection>
        <Section title="Profundizar en los datos">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <MetricBox icon="📅" title="Antigüedad promedio" value={`${props.avgYearsRegen} años en regenerativo`} />
            <MetricBox icon="🎓" title="Ofrecen cursos" value={`${props.withCourses} ganaderos (${Math.round((props.withCourses / props.totalRanchers) * 100)}%)`} />
            <MetricBox icon="📊" title="Total registrados" value={`${props.totalRanchers} ganaderos`} />
          </div>

          {props.bizData.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-800 mb-3">Distribución por tipo de ganadería</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
                <SystemBars data={props.bizData} />
              </div>
            </div>
          )}

          {props.sizeData.length > 0 && (
            <div className="mb-8">
              <h3 className="font-medium text-gray-800 mb-3">Distribución por tamaño de finca</h3>
              <p className="text-sm text-gray-500 mb-3">La ganadería regenerativa es aplicable a cualquier escala</p>
              <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
                <SizeBars data={props.sizeData} />
              </div>
            </div>
          )}

          {props.growthData.length > 1 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Crecimiento de la adopción</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <GrowthLine data={props.growthData} />
              </div>
            </div>
          )}
        </Section>
      </ExpandableSection>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
      {children}
    </section>
  )
}

function MetricBox({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-sm text-primary font-semibold mt-1">{value}</p>
    </div>
  )
}

function PctCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-3xl font-bold text-primary">{value}%</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  )
}
