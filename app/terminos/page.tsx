import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Uso — Regenerando Ando',
  description: 'Términos y condiciones de uso de Regenerando Ando, el directorio mundial de ganaderos regenerativos.',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Términos de Uso
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Última actualización: 4 de abril de 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceptación de los términos</h2>
            <p>
              Al acceder y utilizar <strong>Regenerando Ando</strong> (regenerandoando.com), aceptas estos
              Términos de Uso en su totalidad. Si no estás de acuerdo con alguno de estos términos,
              por favor no utilices la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descripción del servicio</h2>
            <p>
              Regenerando Ando es un directorio mundial de ganaderos regenerativos. La plataforma permite
              a ganaderos registrar su rancho, publicar un perfil público, y conectar con otros ganaderos
              y personas interesadas en la ganadería regenerativa.
            </p>
            <p className="mt-2">
              El servicio es gratuito y es operado por Daniel Suárez a través de GanaderiaRegenerativa.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Registro y cuenta</h2>
            <p>Para registrarte como ganadero en la plataforma:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Debes ser mayor de 18 años.</li>
              <li>Debes proporcionar información veraz y actualizada.</li>
              <li>Eres responsable de mantener la seguridad de tu cuenta.</li>
              <li>Solo puedes registrar ranchos en los que participas directamente como ganadero o propietario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Derecho de admisión</h2>
            <p>
              Regenerando Ando se reserva el <strong>derecho de admisión</strong>. El objetivo del directorio
              es reflejar exclusivamente a ganaderos que practican ganadería regenerativa.
            </p>
            <p className="mt-2">Esto significa que:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Todos los perfiles pasan por un proceso de <strong>revisión manual</strong> antes de ser publicados.</li>
              <li>Podemos <strong>rechazar</strong> perfiles que no cumplan con los criterios del directorio.</li>
              <li>Podemos <strong>retirar</strong> perfiles publicados si se determina que la información es falsa o que el rancho no practica ganadería regenerativa.</li>
              <li>La decisión de admisión es a criterio del equipo de Regenerando Ando y no es apelable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contenido del usuario</h2>
            <p>Al publicar contenido en la plataforma (textos, fotos, datos), declaras que:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Eres el autor o tienes los derechos necesarios para publicar dicho contenido.</li>
              <li>El contenido es veraz y refleja la realidad de tu operación ganadera.</li>
              <li>No infringe derechos de terceros (propiedad intelectual, privacidad, etc.).</li>
              <li>No contiene información difamatoria, ofensiva o ilegal.</li>
            </ul>
            <p className="mt-2">
              Otorgas a Regenerando Ando una licencia no exclusiva, gratuita y mundial para mostrar,
              distribuir y promocionar el contenido que publiques en el directorio, con el único fin
              de operar y difundir la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Uso aceptable</h2>
            <p>Al usar la plataforma, te comprometes a <strong>no</strong>:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Proporcionar información falsa o engañosa sobre tu rancho o tus prácticas.</li>
              <li>Registrar ranchos que no practican ganadería regenerativa.</li>
              <li>Usar la plataforma para spam, publicidad no relacionada o fines comerciales no autorizados.</li>
              <li>Extraer datos masivamente (scraping) sin autorización.</li>
              <li>Intentar acceder a cuentas o datos de otros usuarios.</li>
              <li>Interferir con el funcionamiento de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Sistema de invitaciones</h2>
            <p>
              Los ganaderos aprobados pueden invitar a otros ganaderos a registrarse. Al usar el sistema
              de invitaciones:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Solo debes invitar a personas que realmente practican ganadería regenerativa.</li>
              <li>No debes usar el sistema para enviar comunicaciones no deseadas.</li>
              <li>El hecho de ser invitado no garantiza la aprobación del perfil.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Propiedad intelectual</h2>
            <p>
              La marca <strong>Regenerando Ando</strong>, el diseño de la plataforma, el código fuente y
              todo el contenido creado por el equipo son propiedad de Daniel Suárez / GanaderiaRegenerativa.com.
            </p>
            <p className="mt-2">
              Los datos y contenidos publicados por cada ganadero siguen siendo propiedad de cada usuario.
              Al registrarte, nos otorgas permiso para mostrarlos en la plataforma según lo descrito en
              la sección 5.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitación de responsabilidad</h2>
            <p>
              Regenerando Ando es un directorio informativo. <strong>No nos hacemos responsables de:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>La veracidad de la información publicada por cada ganadero.</li>
              <li>Las transacciones comerciales o acuerdos que surjan entre usuarios.</li>
              <li>Daños directos o indirectos derivados del uso de la plataforma.</li>
              <li>La disponibilidad continua e ininterrumpida del servicio.</li>
              <li>La pérdida de datos por causas técnicas o de fuerza mayor.</li>
            </ul>
            <p className="mt-2">
              Cada ganadero es responsable de la información que publica y de las interacciones
              que realice a través de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Suspensión y cancelación</h2>
            <p>Nos reservamos el derecho de suspender o cancelar tu cuenta si:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Violas estos Términos de Uso.</li>
              <li>Proporcionas información falsa o engañosa.</li>
              <li>Usas la plataforma de manera abusiva o perjudicial.</li>
            </ul>
            <p className="mt-2">
              Tú también puedes solicitar la cancelación de tu cuenta en cualquier momento
              escribiendo a{' '}
              <a href="mailto:daniel@regenerandoando.com" className="text-primary hover:underline">
                daniel@regenerandoando.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Gratuidad del servicio</h2>
            <p>
              El uso de Regenerando Ando es <strong>completamente gratuito</strong>. No cobramos por el
              registro, la publicación de perfiles ni el uso de ninguna funcionalidad de la plataforma.
              Nos reservamos el derecho de introducir funcionalidades premium en el futuro, las cuales
              serían opcionales y no afectarían las funcionalidades gratuitas existentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Modificaciones</h2>
            <p>
              Podemos modificar estos Términos de Uso en cualquier momento. Los cambios significativos
              serán comunicados a través de la plataforma. El uso continuado del servicio después de
              cualquier modificación constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes aplicables en la jurisdicción del operador de la
              plataforma. Cualquier disputa que no pueda resolverse de forma amistosa será sometida a
              los tribunales competentes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Contacto</h2>
            <p>
              Si tienes preguntas sobre estos términos, escríbenos a:{' '}
              <a href="mailto:daniel@regenerandoando.com" className="text-primary hover:underline">
                daniel@regenerandoando.com
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-center gap-6">
          <Link
            href="/privacidad"
            className="text-primary font-medium hover:underline"
          >
            Política de Privacidad
          </Link>
          <Link
            href="/"
            className="text-primary font-medium hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
