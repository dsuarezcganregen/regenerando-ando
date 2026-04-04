import Link from "next/link"
import StatsCounter from "@/components/StatsCounter"
import HomeMapPreview from "@/components/HomeMapPreview"
import { createClient } from "@/lib/supabase/server"

async function getData() {
  const supabase = await createClient()

  // Stats from view (only approved)
  const { data: dashboardStats } = await supabase
    .from("dashboard_stats")
    .select("total_ranchers, species_count, country")

  const ranchers = dashboardStats?.reduce((sum, row) => sum + (row.total_ranchers || 0), 0) || 0
  const countries = dashboardStats?.filter(r => r.total_ranchers > 0).length || 0
  const speciesSet = new Set<string>()
  const { data: speciesData } = await supabase
    .from("ranch_species")
    .select("species, profiles!inner(status)")
    .eq("profiles.status", "aprobado")
  speciesData?.forEach(s => speciesSet.add(s.species))

  // Results count
  const { data: envAll } = await supabase
    .from("results_environmental")
    .select("profile_id, would_eliminate_regen:profiles!inner(status)")
    .eq("profiles.status", "aprobado")
  const totalWithResults = envAll?.length || 0

  // Verdict
  const { data: econAll } = await supabase
    .from("results_economic")
    .select("would_eliminate_regen, would_recommend, profiles!inner(status)")
    .eq("profiles.status", "aprobado")
  const econCount = econAll?.length || 1
  const wouldNotElim = econAll?.filter(e => !e.would_eliminate_regen).length || 0
  const wouldRecommend = econAll?.filter(e => e.would_recommend).length || 0
  const wouldNotElimPct = econCount > 0 ? Math.round((wouldNotElim / econCount) * 100) : 0
  const wouldRecommendPct = econCount > 0 ? Math.round((wouldRecommend / econCount) * 100) : 0

  // Map markers
  const { data: mapData } = await supabase.from("map_markers").select("latitude, longitude, country")
  const mapMarkers = (mapData || []).map(m => ({ lat: m.latitude, lng: m.longitude, country: m.country || '' }))

  return {
    ranchers,
    countries,
    species: speciesSet.size,
    totalWithResults,
    wouldNotElimPct,
    wouldRecommendPct,
    econCount,
    mapMarkers,
  }
}

export default async function Home() {
  const data = await getData()

  const statsItems = [
    { label: "Ganaderos", value: data.ranchers },
    { label: "Países", value: data.countries },
    { label: "Especies manejadas", value: data.species },
    { label: "Con resultados", value: data.totalWithResults },
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
            {data.ranchers} ganaderos de {data.countries} países demuestran que funciona.
            Encuentra, conecta y aprende de ellos.
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

      {/* Mapa preview */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <HomeMapPreview markers={data.mapMarkers} />
          </div>
          <div className="text-center mt-6">
            <Link
              href="/mapa"
              className="text-primary font-medium hover:underline inline-flex items-center gap-2"
            >
              Ver mapa interactivo completo
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* El veredicto */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 mb-8">
            Basado en {data.econCount} ganaderos que reportaron resultados detallados
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#0F6E56] rounded-2xl p-8 sm:p-10 text-center">
              <div className="text-6xl sm:text-7xl font-black text-white leading-none">
                {100 - data.wouldNotElimPct}%
              </div>
              <p className="text-white/80 text-base sm:text-lg mt-4 leading-relaxed">
                De los ganaderos eliminaría la ganadería regenerativa de su negocio
              </p>
            </div>

            <div className="bg-[#0F6E56] rounded-2xl p-8 sm:p-10 text-center">
              <div className="text-6xl sm:text-7xl font-black text-white leading-none">
                {data.wouldRecommendPct}%
              </div>
              <p className="text-white/80 text-base sm:text-lg mt-4 leading-relaxed">
                La recomienda a ojo cerrado
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/dashboard"
              className="text-primary font-medium hover:underline inline-flex items-center gap-2"
            >
              Ver todos los resultados en el dashboard
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            ¿Eres ganadero regenerativo?
          </h2>
          <p className="mt-3 text-lg text-white/80">
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
