'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, AreaChart, Area } from 'recharts'

const DashboardMiniMap = dynamic(() => import('@/components/DashboardMiniMap'), { ssr: false })

// ─── Types ────────────────────────────────────────────
interface Props {
  counters: { ranchers: number; countries: number; species: number; hectares: number }
  verdict: { wouldNotElimPct: number; wouldRecommendPct: number; totalWithResults: number }
  ecosystems: {
    data: { name: string; value: number }[]
    altMin: number; altMax: number; precMin: number; precMax: number
  }
  evidence: {
    capacityBefore: number | null; capacityAfter: number | null; capacityPct: number | null; capacityCount: number
    foragePct: number; forageCount: number
    soilPct: number; soilCount: number
    erosionPct: number; erosionCount: number
    wildlifePct: number; wildlifeCount: number
    agrochemZeroPct: number; agrochemCount: number
    profitPct: number; profitCount: number
    workPct: number; workCount: number
    parasitePct: number; parasiteCount: number
  }
  systems: { name: string; value: number }[]
  geography: {
    countryData: { name: string; flag: string; value: number }[]
    mapMarkers: { lat: number; lng: number; country: string }[]
    totalRanchers: number
  }
  deepDive: {
    growthData: { month: string; total: number }[]
    bizData: { name: string; value: number }[]
    sizeData: { name: string; value: number }[]
  }
}

// ─── Intersection Observer Hook ──────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setInView(true); return }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ─── Animated Counter ────────────────────────────────
function AnimatedNumber({ value, duration = 1500, inView }: { value: number; duration?: number; inView: boolean }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (!inView) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setDisplay(value); return }
    let start = 0
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, value, duration])
  return <>{display.toLocaleString('es-MX')}</>
}

// ─── Progress Ring ───────────────────────────────────
function ProgressRing({ pct, size = 120, stroke = 10, inView, children }: {
  pct: number; size?: number; stroke?: number; inView: boolean; children: React.ReactNode
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    if (!inView) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setOffset(circ * (1 - pct / 100)); return }
    const target = circ * (1 - pct / 100)
    let start: number
    const animate = (now: number) => {
      if (!start) start = now
      const progress = Math.min((now - start) / 1000, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setOffset(circ - eased * (circ - target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, pct, circ])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1D9E75" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-none" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ─── SVG Icons ───────────────────────────────────────
function IconPeople() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconFlag() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}
function IconPaw() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="8" cy="4.5" rx="2" ry="2.5" /><ellipse cx="16" cy="4.5" rx="2" ry="2.5" />
      <ellipse cx="4.5" cy="10" rx="2" ry="2.5" /><ellipse cx="19.5" cy="10" rx="2" ry="2.5" />
      <path d="M12 18c-4 0-6-3-6-6s4-4 6-4 6 1 6 4-2 6-6 6z" />
    </svg>
  )
}

function IconPlant() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5"><path d="M12 22V8"/><path d="M5 12c0-4 3-8 7-8"/><path d="M19 12c0-4-3-8-7-8"/><path d="M5 20c2-3 4-4 7-4s5 1 7 4"/></svg> }
function IconSoil() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5"><path d="M2 22h20"/><path d="M6 18h12"/><path d="M4 14h16"/><path d="M8 10h8"/><circle cx="12" cy="6" r="2"/></svg> }
function IconShield() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function IconAnimal() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5"><path d="M6 9l6-6 6 6"/><path d="M12 3v18"/><circle cx="6" cy="15" r="2"/><circle cx="18" cy="15" r="2"/></svg> }

function CowSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 30" className={className} fill="#0F6E56">
      <path d="M5 8c0-2 1-3 3-4 1-1 3-1 4 0l1 2h14l1-2c1-1 3-1 4 0 2 1 3 2 3 4v8c0 3-2 5-5 6v4h-3v-3H13v3h-3v-4c-3-1-5-3-5-6V8z" opacity="0.8"/>
    </svg>
  )
}

// ─── Main Component ──────────────────────────────────
export default function DashboardNarrative(props: Props) {
  const { counters, verdict, ecosystems, evidence, systems, geography, deepDive } = props

  return (
    <div className="bg-white">
      <HeroSection counters={counters} />
      <VerdictSection verdict={verdict} />
      <EcosystemSection ecosystems={ecosystems} />
      <EvidenceSection evidence={evidence} totalWithResults={verdict.totalWithResults} />
      <SystemsSection systems={systems} />
      <GeographySection geography={geography} />
      <DeepDiveSection deepDive={deepDive} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 1 — HERO
// ═══════════════════════════════════════════════════════
function HeroSection({ counters }: { counters: Props['counters'] }) {
  const { ref, inView } = useInView(0.1)

  return (
    <section ref={ref} className="relative min-h-[90vh] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #085041 0%, #0F6E56 50%, #0a5a44 100%)' }}>
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
          La ganadería regenerativa no es teoría.{' '}
          <span className="text-emerald-300">Es una realidad global que funciona.</span>
        </h1>

        {/* Hectares — big number */}
        <div className="mt-12 sm:mt-16 bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-10 text-center shadow-lg max-w-2xl mx-auto">
          <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary">
            <AnimatedNumber value={counters.hectares} inView={inView} />
          </div>
          <div className="text-lg sm:text-xl text-gray-600 mt-3 font-medium">hectáreas en ganadería regenerativa</div>
        </div>

        {/* 3 counters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {[
            { icon: <IconPeople />, value: counters.ranchers, label: 'Ganaderos registrados' },
            { icon: <IconFlag />, value: counters.countries, label: 'Países representados' },
            { icon: <IconPaw />, value: counters.species, label: 'Especies manejadas' },
          ].map((item, i) => (
            <div key={i} className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-8 text-center shadow-lg">
              <div className="flex justify-center mb-3">{item.icon}</div>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900">
                <AnimatedNumber value={item.value} inView={inView} />
              </div>
              <div className="text-sm text-gray-500 mt-2 font-medium">{item.label}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-emerald-200/70 text-sm">
          Datos actualizados en tiempo real desde la base de datos del directorio
        </p>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 2 — EL VEREDICTO
// ═══════════════════════════════════════════════════════
function VerdictSection({ verdict }: { verdict: Props['verdict'] }) {
  const { ref, inView } = useInView(0.2)

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader title="Veredicto final"
          subtitle={`Resultados contundentes de ${verdict.totalWithResults} reportes detallados`} />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className={`bg-[#0F6E56] rounded-3xl p-10 sm:p-12 text-center transition-all duration-700 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-none">
              {inView ? `${100 - verdict.wouldNotElimPct}%` : '0%'}
            </div>
            <p className="text-white/80 text-lg mt-4 leading-relaxed max-w-xs mx-auto">
              De los ganaderos eliminaría la ganadería regenerativa de su negocio
            </p>
            <div className="mt-6 flex justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
              </svg>
            </div>
          </div>

          <div className={`bg-[#0F6E56] rounded-3xl p-10 sm:p-12 text-center transition-all duration-700 delay-200 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-none">
              {inView ? `${verdict.wouldRecommendPct}%` : '0%'}
            </div>
            <p className="text-white/80 text-lg mt-4 leading-relaxed max-w-xs mx-auto">
              La recomienda a ojo cerrado
            </p>
            <div className="mt-6 flex justify-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 3 — ECOSYSTEMS
// ═══════════════════════════════════════════════════════
function EcosystemSection({ ecosystems }: { ecosystems: Props['ecosystems'] }) {
  const { ref, inView } = useInView(0.15)
  const { altMin, altMax, precMin, precMax, data } = ecosystems

  // Group ecosystems for the landscape cards
  const tropical = data.filter(d => d.name.includes('tropical') || d.name.includes('Humedal'))
  const temperate = data.filter(d => d.name.includes('Pastizal') || d.name.includes('Sabana') || d.name.includes('agroforestal') || d.name.includes('templado'))
  const arid = data.filter(d => d.name.includes('Semiárido') || d.name.includes('Páramo'))
  const tropicalCount = tropical.reduce((s, d) => s + d.value, 0)
  const temperateCount = temperate.reduce((s, d) => s + d.value, 0)
  const aridCount = arid.reduce((s, d) => s + d.value, 0)

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader title="Funciona en todas las condiciones"
          subtitle={`Ganaderos regenerativos desde el nivel del mar hasta los ${altMax?.toLocaleString('es-MX')} msnm, en climas de ${precMin?.toLocaleString('es-MX')} a más de ${precMax?.toLocaleString('es-MX')} mm de lluvia al año`} />

        {/* Landscape SVG infographic */}
        <div className={`mt-12 transition-all duration-1000 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-3xl overflow-hidden p-4 sm:p-8">
            <svg viewBox="0 0 1000 300" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
              {/* Sky */}
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="tropical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="savanna" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#65A30D" /><stop offset="100%" stopColor="#4D7C0F" />
                </linearGradient>
                <linearGradient id="aridGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A16207" /><stop offset="100%" stopColor="#854D0E" />
                </linearGradient>
              </defs>

              {/* Terrain profile - rising from left (sea level) to right (mountain) */}
              <path d="M0 280 Q50 280 100 270 Q200 255 300 240 Q400 220 500 190 Q600 160 700 130 Q800 90 850 60 Q900 40 950 50 Q980 55 1000 60 L1000 300 L0 300 Z"
                fill="url(#tropical)" opacity="0.2" />

              {/* Tropical zone (left) */}
              <path d="M0 280 Q80 275 150 265 Q200 258 280 245 L280 300 L0 300 Z" fill="url(#tropical)" opacity="0.6" />
              {/* Trees */}
              <circle cx="60" cy="258" r="18" fill="#059669" opacity="0.7" />
              <circle cx="90" cy="252" r="22" fill="#047857" opacity="0.6" />
              <circle cx="130" cy="248" r="20" fill="#059669" opacity="0.7" />
              <circle cx="170" cy="244" r="18" fill="#047857" opacity="0.6" />
              <circle cx="210" cy="238" r="15" fill="#059669" opacity="0.7" />
              <rect x="58" y="258" width="4" height="22" fill="#6B4423" rx="1" />
              <rect x="88" y="252" width="4" height="28" fill="#6B4423" rx="1" />
              <rect x="128" y="248" width="4" height="32" fill="#6B4423" rx="1" />

              {/* Savanna/temperate zone (middle) */}
              <path d="M280 245 Q400 220 520 190 L520 300 L280 300 Z" fill="url(#savanna)" opacity="0.5" />
              {/* Grass tufts */}
              {[320, 360, 400, 440, 480].map((x, i) => (
                <g key={i}>
                  <path d={`M${x} ${235 - i * 8} q5-12 0-20 q-5 12 0 20`} fill="#84CC16" opacity="0.7" />
                  <path d={`M${x + 5} ${237 - i * 8} q3-10 0-16 q-3 10 0 16`} fill="#65A30D" opacity="0.6" />
                </g>
              ))}

              {/* Arid/mountain zone (right) */}
              <path d="M520 190 Q650 140 750 100 Q820 70 870 50 Q920 35 960 45 Q990 50 1000 55 L1000 300 L520 300 Z"
                fill="url(#aridGrad)" opacity="0.4" />
              {/* Mountain peaks */}
              <path d="M800 100 L850 50 L900 90 Z" fill="#9CA3AF" opacity="0.3" />
              <path d="M850 50 L870 35 L890 50 Z" fill="#E5E7EB" opacity="0.5" />
              {/* Cacti */}
              <rect x="700" y="105" width="6" height="30" fill="#A16207" rx="3" opacity="0.6" />
              <rect x="696" y="115" width="5" height="12" fill="#A16207" rx="2" opacity="0.6" transform="rotate(-30 696 115)" />
              <rect x="760" y="85" width="5" height="25" fill="#A16207" rx="2" opacity="0.6" />

              {/* Labels */}
              <text x="140" y="298" textAnchor="middle" fill="#047857" fontSize="14" fontWeight="600">Bosque tropical</text>
              <text x="400" y="298" textAnchor="middle" fill="#4D7C0F" fontSize="14" fontWeight="600">Pastizal / Sabana</text>
              <text x="750" y="298" textAnchor="middle" fill="#854D0E" fontSize="14" fontWeight="600">Semiárido / Páramo</text>

              {/* Altitude labels */}
              <text x="30" y="268" fill="#6B7280" fontSize="11" fontWeight="500">Nivel del mar</text>
              <text x="870" y="30" fill="#6B7280" fontSize="11" fontWeight="500">{`>${(altMax || 3000).toLocaleString('es-MX')} msnm`}</text>

              {/* Dashed altitude line */}
              <line x1="0" y1="280" x2="960" y2="42" stroke="#9CA3AF" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
            </svg>

            {/* Precipitation bar below */}
            <div className="mt-4 px-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-amber-700 font-medium whitespace-nowrap">{precMin?.toLocaleString('es-MX')} mm/a</span>
                <div className="flex-1 h-3 rounded-full" style={{ background: 'linear-gradient(to right, #D97706, #65A30D, #0F6E56, #0369A1)' }} />
                <span className="text-xs text-blue-700 font-medium whitespace-nowrap">{`>${precMax?.toLocaleString('es-MX')} mm/a`}</span>
              </div>
              <p className="text-center text-xs text-gray-400 mt-1">Precipitación anual</p>
            </div>
          </div>

          {/* Ecosystem count cards */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Bosque tropical', count: tropicalCount, color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700', icon: '🌳' },
              { label: 'Pastizal y sabana', count: temperateCount, color: 'bg-lime-50 border-lime-200', textColor: 'text-lime-700', icon: '🌾' },
              { label: 'Semiárido y páramo', count: aridCount, color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', icon: '🏜️' },
            ].map((eco, i) => (
              <div key={i} className={`${eco.color} border rounded-2xl p-6 text-center`}>
                <div className="text-3xl mb-2">{eco.icon}</div>
                <div className={`text-2xl font-bold ${eco.textColor}`}>{eco.count}</div>
                <div className="text-sm text-gray-600 mt-1">{eco.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 4 — LA EVIDENCIA TANGIBLE
// ═══════════════════════════════════════════════════════
function EvidenceSection({ evidence, totalWithResults }: { evidence: Props['evidence']; totalWithResults: number }) {
  const ringsRef = useInView(0.15)
  const economyRef = useInView(0.15)

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader title="La evidencia tangible"
          subtitle={`Resultados reportados por ${totalWithResults} ganaderos regenerativos de toda Latinoam\u00e9rica`} />

        {/* Capacity */}
        {evidence.capacityBefore && evidence.capacityAfter && (
          <div className="mt-12 bg-[#E1F5EE] rounded-3xl p-8 sm:p-12">
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Capacidad de carga</h3>
            <p className="text-sm text-gray-500 text-center mb-8">Basado en {evidence.capacityCount} ganaderos</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
              {/* Before */}
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {Array.from({ length: Math.min(8, Math.max(2, Math.round(evidence.capacityBefore))) }).map((_, i) => (
                    <CowSilhouette key={i} className="w-10 h-8 opacity-40" />
                  ))}
                </div>
                <div className="text-3xl font-bold text-gray-400">{evidence.capacityBefore}</div>
                <div className="text-sm text-gray-500">UA/ha antes</div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center">
                <svg width="60" height="24" viewBox="0 0 60 24" className="text-primary hidden sm:block">
                  <path d="M0 12h50M42 4l10 8-10 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg width="24" height="40" viewBox="0 0 24 40" className="text-primary sm:hidden">
                  <path d="M12 0v30M4 22l8 10 8-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* After */}
              <div className="text-center">
                <div className="flex justify-center gap-1 mb-3">
                  {Array.from({ length: Math.min(8, Math.max(2, Math.round(evidence.capacityAfter))) }).map((_, i) => (
                    <CowSilhouette key={i} className="w-10 h-8" />
                  ))}
                </div>
                <div className="text-3xl font-bold text-primary">{evidence.capacityAfter}</div>
                <div className="text-sm text-gray-500">UA/ha después</div>
              </div>

              {/* Percentage */}
              {evidence.capacityPct && (
                <div className="bg-white rounded-2xl px-8 py-6 text-center shadow-sm">
                  <div className="text-4xl font-black text-primary">+{evidence.capacityPct}%</div>
                  <div className="text-sm text-gray-600 mt-1">incremento</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Environmental rings */}
        <div ref={ringsRef.ref} className="mt-16">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-8">Resultados ambientales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
            {[
              { pct: evidence.foragePct, count: evidence.forageCount, label: 'Más diversidad de plantas', icon: <IconPlant /> },
              { pct: evidence.soilPct, count: evidence.soilCount, label: 'Mejor cobertura de suelo', icon: <IconSoil /> },
              { pct: evidence.erosionPct, count: evidence.erosionCount, label: 'Menos erosión', icon: <IconShield /> },
              { pct: evidence.wildlifePct, count: evidence.wildlifeCount, label: 'Aumento de fauna silvestre', icon: <IconAnimal /> },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <ProgressRing pct={item.pct} inView={ringsRef.inView}>
                  <span className="text-2xl font-bold text-gray-900">{ringsRef.inView ? item.pct : 0}%</span>
                </ProgressRing>
                <div className="mt-3 flex justify-center">{item.icon}</div>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 text-center max-w-[120px]">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-gray-400 text-center">Basado en {item.count} ganaderos</p>
              </div>
            ))}
          </div>

          {/* Indicator species */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500 mb-4">Especies indicadoras de ecosistemas sanos reportadas por los ganaderos</p>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              {['Escarabajo estercolero', 'Garza', 'Venado', 'Rapaces', 'Nutria'].map((sp) => (
                <div key={sp} className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 text-lg">
                    {sp === 'Escarabajo estercolero' ? '🪲' : sp === 'Garza' ? '🦢' : sp === 'Venado' ? '🦌' : sp === 'Rapaces' ? '🦅' : '🦦'}
                  </div>
                  <span className="text-xs text-gray-500">{sp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Economic impact */}
        <div ref={economyRef.ref} className="mt-16">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-8">Impacto económico y social</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { pct: evidence.agrochemZeroPct, count: evidence.agrochemCount, label: 'Eliminación total de agrotóxicos', icon: '🚫' },
              { pct: evidence.profitPct, count: evidence.profitCount, label: 'Rentabilidad mejorada', icon: '📈' },
              { pct: evidence.workPct, count: evidence.workCount, label: 'Trabajo simplificado', icon: '👥' },
              { pct: evidence.parasitePct, count: evidence.parasiteCount, label: 'Mejora en parásitos', icon: '🛡️' },
            ].map((item, i) => (
              <div key={i} className={`bg-[#E1F5EE] rounded-2xl p-6 text-center transition-all duration-500 ${
                economyRef.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-3xl sm:text-4xl font-bold text-primary">{economyRef.inView ? item.pct : 0}%</div>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-1">Basado en {item.count} ganaderos</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 5 — SYSTEMS BUBBLE CHART
// ═══════════════════════════════════════════════════════
function SystemsSection({ systems }: { systems: Props['systems'] }) {
  const { ref, inView } = useInView(0.15)
  const maxVal = Math.max(...systems.map(s => s.value), 1)

  // Bubble positions - spread organically
  const positions = [
    { x: 50, y: 45 },  // center-left
    { x: 32, y: 65 },  // bottom-left
    { x: 72, y: 55 },  // center-right
    { x: 20, y: 35 },  // top-left
    { x: 80, y: 30 },  // top-right
    { x: 55, y: 75 },  // bottom-center
    { x: 85, y: 70 },  // bottom-right
  ]

  const greens = ['#085041', '#0F6E56', '#1D9E75', '#2AB88A', '#48D1A0', '#65D9B2', '#82E1C4']

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6">
        <SectionHeader title="Sistemas de manejo" subtitle="Distribución de los principales sistemas regenerativos utilizados" />

        <div className="mt-12 relative" style={{ height: '400px' }}>
          {systems.slice(0, 7).map((sys, i) => {
            const pos = positions[i] || { x: 50, y: 50 }
            const ratio = sys.value / maxVal
            const minSize = 60
            const maxSize = 180
            const size = minSize + ratio * (maxSize - minSize)

            return (
              <div key={sys.name}
                className={`absolute transition-all ease-out ${inView ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) scale(${inView ? 1 : 0})`,
                  transitionDuration: '800ms',
                  transitionDelay: `${i * 100}ms`,
                  width: size,
                  height: size,
                }}>
                <div className="w-full h-full rounded-full flex flex-col items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: greens[i] || greens[greens.length - 1] }}>
                  <span className="text-xl sm:text-2xl font-bold">{sys.value}</span>
                  {size > 80 && <span className="text-[10px] sm:text-xs opacity-80 mt-0.5 px-2 text-center leading-tight">{sys.name}</span>}
                </div>
                {size <= 80 && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">{sys.name}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 6 — GEOGRAPHY
// ═══════════════════════════════════════════════════════
function GeographySection({ geography }: { geography: Props['geography'] }) {
  const { ref, inView } = useInView(0.1)
  const maxCountry = Math.max(...geography.countryData.map(c => c.value), 1)

  return (
    <section ref={ref} className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader title="Escala global" subtitle="Directorio de ganadería regenerativa global" />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="h-[350px] sm:h-[400px]">
              <DashboardMiniMap markers={geography.mapMarkers} />
            </div>
            <div className="p-4 text-center">
              <Link href="/mapa" className="text-primary font-medium text-sm hover:underline inline-flex items-center gap-2">
                Ver mapa interactivo completo
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Country bars */}
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Top países</h3>
            <div className="space-y-3">
              {geography.countryData.map((country, i) => (
                <div key={country.name} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{country.flag}</span>
                  <span className="text-sm text-gray-700 w-24 truncate">{country.name}</span>
                  <div className="flex-1 h-7 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-800"
                      style={{
                        width: inView ? `${Math.max((country.value / maxCountry) * 100, 8)}%` : '0%',
                        backgroundColor: i === 0 ? '#085041' : i === 1 ? '#0F6E56' : '#1D9E75',
                        transitionDelay: `${i * 80}ms`,
                      }}>
                      <span className="text-xs font-bold text-white">{country.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════
// SECTION 7 — DEEP DIVE (Accordions)
// ═══════════════════════════════════════════════════════
function DeepDiveSection({ deepDive }: { deepDive: Props['deepDive'] }) {
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader title="Para profundizar" subtitle="Más datos de la ganadería regenerativa" />

        <div className="mt-12 space-y-4">
          <Accordion title="Crecimiento de la adopción">
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={deepDive.growthData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F6E56" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0F6E56" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stroke="#0F6E56" strokeWidth={2} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Accordion>

          <Accordion title="Tipos de ganadería">
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={Math.max(deepDive.bizData.length * 45, 200)}>
                <BarChart data={deepDive.bizData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1D9E75" radius={[0, 8, 8, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion>

          <Accordion title="Distribución por tamaño de finca">
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <p className="text-sm text-gray-500 mb-4">La ganadería regenerativa funciona en cualquier escala</p>
              <ResponsiveContainer width="100%" height={Math.max(deepDive.sizeData.length * 45, 200)}>
                <BarChart data={deepDive.sizeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0F6E56" radius={[0, 8, 8, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Accordion>
        </div>

        {/* PDF placeholder */}
        <div className="mt-10 text-center">
          <button className="border-2 border-gray-300 text-gray-500 px-6 py-3 rounded-xl text-sm font-medium cursor-not-allowed opacity-70 inline-flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" />
            </svg>
            Descargar resumen de datos (PDF) — Próximamente
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Shared Components ───────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-4">
      <h2 className="text-2xl sm:text-3xl font-medium text-gray-900">{title}</h2>
      <p className="text-sm sm:text-base text-gray-500 mt-3 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  )
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors">
        <span className="font-medium text-gray-900">{title}</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  )
}
