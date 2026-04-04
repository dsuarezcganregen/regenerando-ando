import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import HomeMapPreview from "@/components/HomeMapPreview"

async function getMapMarkers() {
  const supabase = await createClient()
  const { data: mapData } = await supabase.from("map_markers").select("latitude, longitude, country")
  return (mapData || []).map(m => ({ lat: m.latitude, lng: m.longitude, country: m.country || '' }))
}

export default async function Home() {
  const mapMarkers = await getMapMarkers()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Regenerando Ando',
    url: 'https://www.regenerandoando.com',
    description: 'El directorio mundial de ganaderos regenerativos.',
    creator: {
      '@type': 'Person',
      name: 'Daniel Suárez',
      url: 'https://ganaderiaregenerativa.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-hero-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            El directorio mundial de{" "}
            <span className="text-primary">ganaderos regenerativos</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Un espacio creado para visibilizar, conectar y documentar a los ganaderos
            que ya practican ganadería regenerativa en el mundo.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/registro"
              className="bg-primary text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
              Registra tu rancho
            </Link>
            <Link
              href="/directorio"
              className="border-2 border-primary text-primary px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-primary hover:text-white transition-colors"
            >
              Explorar directorio
            </Link>
          </div>
        </div>
      </section>

      {/* Qué es Regenerando Ando */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
            ¿Qué es <span className="text-primary">regenerando</span><span className="text-secondary">ando</span>?
          </h2>
          <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
            <p>
              <strong className="text-gray-900">Regenerando Ando</strong> es el primer directorio mundial dedicado
              exclusivamente a ganaderos regenerativos. Un proyecto creado por{" "}
              <a href="https://ganaderiaregenerativa.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Daniel Suárez
              </a>{" "}
              desde GanaderiaRegenerativa.com con el objetivo de documentar, visibilizar y conectar
              a quienes ya están transformando la ganadería en el mundo.
            </p>
            <p>
              No es una red social ni un marketplace. Es una herramienta de documentación
              y visibilización para demostrar, con datos reales de ganaderos reales, que la
              ganadería regenerativa funciona en distintos ecosistemas, climas, escalas y países.
            </p>
          </div>
        </div>
      </section>

      {/* Objetivos */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            ¿Para qué sirve este directorio?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ObjectiveCard
              icon="🌍"
              title="Visibilizar al movimiento"
              description="Poner en el mapa a los ganaderos que ya practican ganadería regenerativa. Que el mundo sepa cuántos son, dónde están y qué están logrando."
            />
            <ObjectiveCard
              icon="📊"
              title="Documentar resultados reales"
              description="Recopilar datos de capacidad de carga, biodiversidad, cobertura del suelo, rentabilidad y más. Evidencia real, de campo, de ganaderos reales."
            />
            <ObjectiveCard
              icon="🤝"
              title="Conectar ganaderos"
              description="Facilitar que ganaderos de diferentes países y ecosistemas se encuentren, compartan experiencias y aprendan unos de otros."
            />
            <ObjectiveCard
              icon="🔬"
              title="Generar evidencia"
              description="Construir la base de datos más grande del mundo sobre ganadería regenerativa. Datos que sirvan para investigación, políticas públicas y toma de decisiones."
            />
            <ObjectiveCard
              icon="🗺️"
              title="Demostrar que funciona en todos lados"
              description="Desde trópico húmedo hasta zonas áridas. Desde 5 hectáreas hasta 10,000. La ganadería regenerativa se adapta a cualquier contexto."
            />
            <ObjectiveCard
              icon="📢"
              title="Dar voz a los ganaderos"
              description="Cada perfil es una mini landing page donde el ganadero cuenta su historia, muestra sus resultados y puede ser contactado directamente."
            />
          </div>
        </div>
      </section>

      {/* Qué información se recopila */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            ¿Qué información se documenta?
          </h2>
          <div className="space-y-6">
            <InfoItem
              title="Datos generales"
              items={["Nombre del rancho y ganadero", "Ubicación (país, estado, municipio, coordenadas)", "Ecosistema, altitud, precipitación"]}
            />
            <InfoItem
              title="La operación ganadera"
              items={["Hectáreas totales y bajo manejo regenerativo", "Años de experiencia", "Sistema de manejo (PRV, Manejo Holístico, PUAD, Silvopastoril, etc.)", "Especies y razas manejadas", "Tipo de negocio y productos"]}
            />
            <InfoItem
              title="Prácticas de manejo"
              items={["Prácticas implementadas (pastoreo no selectivo, silvopastoril, selección genética, etc.)", "Prácticas eliminadas (agrotóxicos, mecanización, fuego, etc.)", "Manejo del agua y cosecha de agua"]}
            />
            <InfoItem
              title="Resultados medibles"
              items={["Capacidad de carga antes y después", "Mejora en materia orgánica y cobertura del suelo", "Aumento de biodiversidad", "Cambios en rentabilidad y dinámica de trabajo", "Testimonial del ganadero"]}
            />
          </div>
        </div>
      </section>

      {/* Mapa */}
      {mapMarkers.length > 0 && (
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-8">
              Ganaderos en el mapa
            </h2>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <HomeMapPreview markers={mapMarkers} />
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
      )}

      {/* Cómo funciona */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="space-y-8">
            <Step number={1} title="Regístrate" description="Crea tu cuenta en menos de un minuto. Es gratis y siempre lo será." />
            <Step number={2} title="Completa tu perfil" description="Llena la información de tu rancho: ubicación, sistema de manejo, especies, hectáreas y más. Tú decides cuánto compartir." />
            <Step number={3} title="Revisión y aprobación" description="Nuestro equipo revisa la información para asegurar la calidad del directorio. Te notificamos cuando tu perfil esté publicado." />
            <Step number={4} title="Tu perfil público" description="Tu rancho aparece en el directorio, el mapa interactivo y contribuye a las estadísticas globales de la ganadería regenerativa." />
          </div>
        </div>
      </section>

      {/* Quién está detrás */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            ¿Quién está detrás?
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Este proyecto es creado y mantenido por{" "}
            <a href="https://ganaderiaregenerativa.com" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
              Daniel Suárez
            </a>
            , fundador de GanaderiaRegenerativa.com, la comunidad de ganadería regenerativa
            más grande en español. Con años documentando y acompañando ganaderos en su
            transición hacia sistemas regenerativos, este directorio nace de la necesidad
            de tener un lugar centralizado donde el movimiento pueda verse reflejado con datos reales.
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            ¿Eres ganadero regenerativo?
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            Tu experiencia importa. Registra tu rancho y ayúdanos a demostrar
            que la ganadería regenerativa funciona.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/registro"
              className="bg-white text-primary px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
            >
              Registrarme gratis
            </Link>
            <a
              href="https://ganaderiaregenerativa.com"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white/50 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-white/10 transition-colors"
            >
              Conocer GanaderiaRegenerativa.com
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

// ==================== COMPONENTS ====================

function ObjectiveCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function InfoItem({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-600">
            <span className="text-primary mt-1 shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  )
}
