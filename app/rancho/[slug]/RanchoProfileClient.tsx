'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const MiniMap = dynamic(() => import('./MiniMapProfile'), { ssr: false })

const systemLabels: Record<string, string> = {
  prv:'PRV',manejo_holistico:'Manejo Holístico',puad:'PUAD',
  silvopastoril:'Silvopastoril',pastoreo_racional:'Pastoreo Racional',otro:'Otro',
}
const speciesLabels: Record<string, string> = {
  bovino:'Bovino',bufalino:'Bufalino',ovino:'Ovino',caprino:'Caprino',
  equino:'Equino',porcino:'Porcino',gallinas:'Gallinas',pollos:'Pollos',
  abejas:'Abejas',otro:'Otro',
}
const ecoShort: Record<string, string> = {
  bosque_tropical_humedo:'Bosque tropical húmedo',bosque_tropical_seco:'Bosque tropical seco',bosque_templado:'Bosque templado',
  pastizal:'Pastizal',sabana:'Sabana',matorral_xerofilo:'Matorral xerófilo',semidesierto:'Semidesierto',
  sistema_agroforestal:'Sistema agroforestal',humedal:'Humedal',otro:'Otro',
}
const resultIcons: Record<string, string> = {
  mejorado:'📈',sin_cambios:'➡️',empeorado:'📉',mejor:'📈',igual:'➡️',peor:'📉',
  simplificado:'✅',complicado:'⚠️',
}

export default function RanchoProfileClient({ ranch, countryNames }: { ranch: any; countryNames: Record<string, string> }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  const loc = Array.isArray(ranch.locations) ? ranch.locations[0] : ranch.locations
  const op = Array.isArray(ranch.operations) ? ranch.operations[0] : ranch.operations
  const species = ranch.ranch_species || []
  const products = ranch.products || []
  const photos = ranch.photos || []
  const envR = (ranch.results_environmental || [])[0]
  const econR = (ranch.results_economic || [])[0]
  const exp = ranch.experience
  const systems = op?.systems || (op?.primary_system ? [op.primary_system] : [])
  const country = countryNames[loc?.country] || loc?.country || ''
  const locationStr = [loc?.locality, loc?.municipality, loc?.state_province, country].filter(Boolean).join(', ')
  const yearsRegen = op?.year_started_regen ? new Date().getFullYear() - op.year_started_regen : null
  const hasResults = envR || econR
  const narrative = econR?.before_after_narrative

  // Photo layout
  const heroPhotos = photos.slice(0, 4)
  const extraPhotos = photos.slice(4)

  return (
    <div className="bg-white min-h-screen">
      {/* SECTION 1: Photo Hero */}
      <div className="max-w-5xl mx-auto px-4">
        {heroPhotos.length >= 4 ? (
          <div className="grid grid-cols-4 grid-rows-2 gap-1.5 rounded-xl overflow-hidden mt-6" style={{ height: '320px' }}>
            <div className="col-span-2 row-span-2"><img src={heroPhotos[0].url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(heroPhotos[0].url)} /></div>
            {heroPhotos.slice(1, 4).map((p: any) => (
              <div key={p.id} className="col-span-1">
                <img src={p.url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(p.url)} />
              </div>
            ))}
          </div>
        ) : heroPhotos.length === 3 ? (
          <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden mt-6" style={{ height: '280px' }}>
            <div className="col-span-2"><img src={heroPhotos[0].url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(heroPhotos[0].url)} /></div>
            <div className="flex flex-col gap-1.5">
              {heroPhotos.slice(1).map((p: any) => <div key={p.id} className="flex-1 overflow-hidden"><img src={p.url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(p.url)} /></div>)}
            </div>
          </div>
        ) : heroPhotos.length === 2 ? (
          <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden mt-6" style={{ height: '260px' }}>
            {heroPhotos.map((p: any) => <img key={p.id} src={p.url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(p.url)} />)}
          </div>
        ) : heroPhotos.length === 1 ? (
          <div className="rounded-xl overflow-hidden mt-6" style={{ height: '300px' }}>
            <img src={heroPhotos[0].url} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setLightbox(heroPhotos[0].url)} />
          </div>
        ) : (
          <div className="bg-hero-bg rounded-xl mt-6 flex items-center justify-center gap-3 text-gray-400" style={{ height: '180px' }}>
            <span className="text-3xl">📷</span>
            <span className="text-sm">Este rancho aún no ha subido fotos</span>
          </div>
        )}

        {/* SECTION 2: Identity */}
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-gray-200 bg-hero-bg flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden">
              {ranch.logo_url ? <img src={ranch.logo_url} alt="" className="w-full h-full object-cover" /> : ranch.ranch_name?.[0]?.toUpperCase() || 'R'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{ranch.ranch_name || 'Sin nombre'}</h1>
              {locationStr && <p className="text-sm text-gray-500 flex items-center gap-1">📍 {locationStr}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {systems.map((s: string) => (
              <span key={s} className="text-xs px-3 py-1 rounded-full" style={{ background: '#E1F5EE', color: '#085041' }}>
                {systemLabels[s] || s}
              </span>
            ))}
            {species.map((s: any) => (
              <span key={s.id} className="text-xs px-3 py-1 rounded-full border border-gray-300 text-gray-600">
                {speciesLabels[s.species] || s.species}
              </span>
            ))}
            {yearsRegen && <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#E1F5EE', color: '#085041' }}>{yearsRegen} años en regenerativo</span>}
            {ranch.offers_courses && <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#FAEEDA', color: '#92400E' }}>Ofrece cursos y visitas</span>}
          </div>

          {ranch.description && <p className="text-gray-600 text-sm leading-relaxed mb-6">{ranch.description}</p>}
        </div>

        <Hr />

        {/* SECTION 3: Numbers */}
        {(species.length > 0 || yearsRegen || (loc?.ecosystem) || loc?.altitude_masl || loc?.annual_precipitation_mm) && (
          <>
            <SectionLabel>El rancho en números</SectionLabel>
            <div className="flex flex-wrap gap-4 mb-4">
              {species.length > 0 && <NumCard value={species.length} label="especies" />}
              {yearsRegen && <NumCard value={yearsRegen} label="años en regenerativo" />}
            </div>
            {(loc?.ecosystem || loc?.altitude_masl || loc?.annual_precipitation_mm) && (
              <div className="flex flex-wrap gap-3 mb-6">
                {loc.ecosystem && <SmallCard label="Ecosistema" value={ecoShort[loc.ecosystem] || loc.ecosystem} />}
                {loc.altitude_masl && <SmallCard label="Altitud" value={`${loc.altitude_masl.toLocaleString('es-MX')} msnm`} />}
                {loc.annual_precipitation_mm && <SmallCard label="Precipitación" value={`${loc.annual_precipitation_mm.toLocaleString('es-MX')} mm/año`} />}
              </div>
            )}
            <Hr />
          </>
        )}

        {/* SECTION 4: Narrative */}
        {narrative && (
          <>
            <SectionLabel>En sus propias palabras</SectionLabel>
            <div className="bg-gray-50 border-l-[3px] border-primary pl-5 pr-4 py-4 mb-2">
              <p className="text-gray-700 italic leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>&ldquo;{narrative}&rdquo;</p>
            </div>
            <p className="text-xs text-gray-400 mb-6">— Testimonio del ganadero</p>
            <Hr />
          </>
        )}

        {/* SECTION 5: Soil observation */}
        {exp?.soil_change_observed && (
          <>
            <SectionLabel>Lo que observa en su suelo</SectionLabel>
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Cambio observado</span>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.soil_change_observed}</p>
            </div>
            <Hr />
          </>
        )}

        {/* SECTION 6: Results */}
        {hasResults && (
          <>
            <SectionLabel>Resultados reportados</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {envR?.carrying_capacity_before != null && envR?.carrying_capacity_after != null && (
                <ResultCard icon={`+${envR.carrying_capacity_after > envR.carrying_capacity_before ? Math.round(((envR.carrying_capacity_after - envR.carrying_capacity_before) / envR.carrying_capacity_before) * 100) : 0}%`}
                  title="Capacidad de carga" desc={`${envR.carrying_capacity_before} → ${envR.carrying_capacity_after} UA/ha`} />
              )}
              {envR?.soil_coverage && <ResultCard icon={resultIcons[envR.soil_coverage] || '🌱'} title="Cobertura de suelo" desc={envR.soil_coverage.replace(/_/g, ' ')} />}
              {envR?.erosion_reduced && <ResultCard icon="🛡️" title="Erosión" desc="Reducida" />}
              {envR?.agrochemical_reduction_pct != null && (
                <ResultCard icon={`${Math.round(envR.agrochemical_reduction_pct * 100)}%`} title="Agrotóxicos" desc={envR.agrochemical_reduction_pct >= 1 ? 'Eliminados' : `Reducidos ${Math.round(envR.agrochemical_reduction_pct * 100)}%`} />
              )}
              {econR?.profitability && <ResultCard icon={resultIcons[econR.profitability] || '💰'} title="Rentabilidad" desc={econR.profitability === 'mejor' ? 'Ha mejorado' : econR.profitability === 'igual' ? 'Sin cambios' : 'Ha empeorado'} />}
              {econR?.work_dynamics && <ResultCard icon={resultIcons[econR.work_dynamics] || '👥'} title="Dinámica laboral" desc={econR.work_dynamics === 'simplificado' ? 'Simplificada' : econR.work_dynamics === 'igual' ? 'Sin cambios' : 'Complicada'} />}
              {econR?.production_change && <ResultCard icon={resultIcons[econR.production_change] || '📦'} title="Producción" desc={econR.production_change.replace(/_/g, ' ')} />}
              {econR?.parasite_situation && <ResultCard icon={resultIcons[econR.parasite_situation] || '🐛'} title="Parásitos" desc={econR.parasite_situation === 'mejor' ? 'Mejorado' : econR.parasite_situation === 'igual' ? 'Sin cambios' : 'Empeorado'} />}
            </div>
            {envR?.wildlife_indicator_species && (
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                <span className="text-green-600">✓</span> Indicador biológico destacado: {envR.wildlife_indicator_species}
              </p>
            )}
            <Hr />
          </>
        )}

        {/* SECTION 7: Products */}
        {(products.length > 0 || ranch.products_description) && (
          <>
            <SectionLabel>Productos disponibles</SectionLabel>
            <div className="flex flex-wrap gap-2 mb-6">
              {products.map((p: any) => (
                <div key={p.id} className="bg-gray-50 rounded-lg px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{p.product_type?.replace(/_/g, ' ')}</p>
                  {p.frequency && <p className="text-xs text-gray-500">{p.frequency}</p>}
                </div>
              ))}
            </div>
            {ranch.products_description && <p className="text-sm text-gray-600 mb-6">{ranch.products_description}</p>}
            <Hr />
          </>
        )}

        {/* SECTION 8: Practices */}
        {exp?.practices_description && (
          <>
            <SectionLabel>¿Qué hace y por qué es regenerativo?</SectionLabel>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">{exp.practices_description}</p>
            <Hr />
          </>
        )}

        {/* SECTION 9: Extra gallery */}
        {extraPhotos.length > 0 && (
          <>
            <SectionLabel>Galería</SectionLabel>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {extraPhotos.map((p: any) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => setLightbox(p.url)}>
                  <img src={p.url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
            <Hr />
          </>
        )}

        {/* SECTION 10: Map */}
        {loc?.latitude && loc?.longitude && (
          <>
            <SectionLabel>Ubicación</SectionLabel>
            <div className="rounded-xl overflow-hidden border border-gray-200 mb-6" style={{ height: '200px' }}>
              <MiniMap lat={loc.latitude} lng={loc.longitude} />
            </div>
            <Hr />
          </>
        )}

        {/* SECTION 11: Contact */}
        <SectionLabel>Contacto</SectionLabel>
        <p className="text-sm font-medium text-gray-700 mb-4">Persona de contacto: {ranch.full_name}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {ranch.show_social !== false && ranch.instagram && <ContactBtn icon="📸" label={`@${ranch.instagram}`} href={`https://instagram.com/${ranch.instagram}`} />}
          {ranch.show_social !== false && ranch.facebook && <ContactBtn icon="📘" label={ranch.facebook} href={`https://facebook.com/${ranch.facebook}`} />}
          {ranch.show_social !== false && ranch.youtube && <ContactBtn icon="🎥" label="YouTube" href={ranch.youtube} />}
          {ranch.show_social !== false && ranch.tiktok && <ContactBtn icon="🎵" label={`@${ranch.tiktok}`} href={`https://tiktok.com/@${ranch.tiktok}`} />}
          {ranch.show_website !== false && ranch.website && <ContactBtn icon="🌐" label={ranch.website.replace(/https?:\/\//, '')} href={ranch.website} />}
          {ranch.show_phone !== false && ranch.phone && <ContactBtn icon="📞" label={`${ranch.phone_country_code || ''} ${ranch.phone}`} href={`tel:${ranch.phone_country_code || ''}${ranch.phone}`} />}
          {ranch.show_email !== false && ranch.email && <ContactBtn icon="✉️" label={ranch.email} href={`mailto:${ranch.email}`} />}
        </div>
        {ranch.show_email !== false && ranch.email && (
          <a href={`mailto:${ranch.email}?subject=${encodeURIComponent(`Contacto desde Regenerando Ando — ${ranch.ranch_name || ''}`)}`}
            className="block w-full text-center bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-dark transition-colors mb-8">
            Contactar a este ganadero
          </a>
        )}

        <p className="text-center text-xs text-gray-400 pb-8">
          Perfil verificado por Regenerando Ando — regenerandoando.com
        </p>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-[90vh] rounded-lg" />
          <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4 mt-8">{children}</p>
}
function Hr() { return <div className="border-t border-gray-100" /> }
function NumCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}
function SmallCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}
function ResultCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 px-4 py-3">
      <div className="w-10 h-10 bg-hero-bg rounded-full flex items-center justify-center text-sm font-bold text-primary shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  )
}
function ContactBtn({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-hero-bg transition-colors">
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-gray-700 truncate">{label}</span>
    </a>
  )
}
