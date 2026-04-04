import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Regenerando Ando',
  description: 'Política de privacidad y protección de datos personales de Regenerando Ando.',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Política de Privacidad
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Última actualización: 3 de abril de 2026
        </p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Responsable del tratamiento</h2>
            <p>
              <strong>Regenerando Ando</strong> (regenerandoando.com) es un proyecto creado y operado por
              Daniel Suárez a través de GanaderiaRegenerativa.com. Para cualquier consulta relacionada
              con tus datos personales, puedes contactarnos en:{' '}
              <a href="mailto:daniel@ganaderiaregenerativa.com" className="text-primary hover:underline">
                daniel@ganaderiaregenerativa.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Datos que recopilamos</h2>
            <p>Cuando te registras como ganadero regenerativo, recopilamos la siguiente información:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Datos de identificación:</strong> nombre completo, correo electrónico, nombre del rancho.</li>
              <li><strong>Datos de contacto opcionales:</strong> teléfono, sitio web, redes sociales (Instagram, Facebook, YouTube, TikTok).</li>
              <li><strong>Datos de ubicación:</strong> país, estado/provincia, municipio, localidad, coordenadas GPS (latitud y longitud), altitud, precipitación anual.</li>
              <li><strong>Datos de la operación ganadera:</strong> hectáreas, años de experiencia, tipo de ganadería, sistema de manejo, especies, razas, productos.</li>
              <li><strong>Prácticas de manejo:</strong> prácticas implementadas y eliminadas, datos de pastoreo, manejo de agua.</li>
              <li><strong>Resultados:</strong> resultados ambientales (capacidad de carga, cobertura del suelo, biodiversidad, etc.) y económicos (rentabilidad, dinámica de trabajo, etc.).</li>
              <li><strong>Fotografías:</strong> imágenes del rancho que el usuario decida subir.</li>
              <li><strong>Logo:</strong> logotipo del rancho, si el usuario decide subirlo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Finalidad del tratamiento</h2>
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Crear y publicar tu perfil público en el directorio de ganaderos regenerativos.</li>
              <li>Mostrar tu ubicación en el mapa interactivo.</li>
              <li>Generar estadísticas agregadas y anónimas en el dashboard público.</li>
              <li>Permitir que otros ganaderos y visitantes te contacten.</li>
              <li>Gestionar tu cuenta y autenticación.</li>
              <li>Mejorar el servicio y la experiencia de usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Consentimiento y publicación</h2>
            <p>
              Tu perfil solo se publica si otorgas tu consentimiento explícito durante el registro
              (casilla &quot;Acepto que mi información sea publicada en el directorio&quot;). Además, cada perfil
              pasa por un proceso de revisión manual antes de hacerse público.
            </p>
            <p className="mt-2">
              Si no das tu consentimiento o tu perfil está pendiente de revisión, tu información
              <strong> no será visible públicamente</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Base legal</h2>
            <p>
              El tratamiento de tus datos se basa en tu consentimiento libre, específico, informado e
              inequívoco, otorgado al momento del registro. Puedes retirar tu consentimiento en cualquier
              momento contactándonos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Compartición de datos</h2>
            <p>
              <strong>No vendemos, alquilamos ni compartimos tus datos personales con terceros</strong> con
              fines comerciales. Los datos que se muestran públicamente son únicamente los que tú
              proporcionas y consientes publicar.
            </p>
            <p className="mt-2">Utilizamos los siguientes servicios de terceros para operar la plataforma:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Supabase</strong> (almacenamiento de datos y autenticación) — servidores en EE.UU.</li>
              <li><strong>Vercel</strong> (hosting de la aplicación) — servidores globales.</li>
              <li><strong>Cloudflare</strong> (DNS y seguridad) — servidores globales.</li>
              <li><strong>OpenStreetMap / Nominatim</strong> (mapas y geocodificación) — servicio público.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas para proteger tus datos, incluyendo:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Cifrado en tránsito (HTTPS/TLS).</li>
              <li>Políticas de seguridad a nivel de fila (Row Level Security) en la base de datos.</li>
              <li>Autenticación segura con verificación de correo electrónico.</li>
              <li>Acceso administrativo restringido y auditado.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Tus derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Acceder</strong> a tus datos personales en cualquier momento desde tu panel &quot;Mi perfil&quot;.</li>
              <li><strong>Rectificar</strong> tus datos editando tu perfil.</li>
              <li><strong>Eliminar</strong> tu cuenta y todos tus datos asociados.</li>
              <li><strong>Retirar</strong> tu consentimiento de publicación.</li>
              <li><strong>Exportar</strong> tus datos en formato legible.</li>
              <li><strong>Oponerte</strong> al tratamiento de tus datos.</li>
            </ul>
            <p className="mt-2">
              Para ejercer cualquiera de estos derechos, contacta a:{' '}
              <a href="mailto:daniel@ganaderiaregenerativa.com" className="text-primary hover:underline">
                daniel@ganaderiaregenerativa.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies</h2>
            <p>
              Utilizamos cookies estrictamente necesarias para el funcionamiento de la autenticación y
              la sesión de usuario. No utilizamos cookies de seguimiento, publicidad ni analítica de
              terceros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Retención de datos</h2>
            <p>
              Conservamos tus datos mientras mantengas tu cuenta activa. Si solicitas la eliminación de
              tu cuenta, procederemos a eliminar todos tus datos personales en un plazo máximo de 30 días.
              Los datos agregados y anónimos utilizados en estadísticas podrán conservarse indefinidamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Menores de edad</h2>
            <p>
              Este servicio está dirigido a ganaderos y profesionales del sector agropecuario. No
              recopilamos intencionalmente datos de menores de 18 años.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Cambios en esta política</h2>
            <p>
              Nos reservamos el derecho de modificar esta política de privacidad. Cualquier cambio
              significativo será notificado a través de la plataforma. La fecha de última actualización
              se indica al inicio de este documento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contacto</h2>
            <p>
              Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, escríbenos a:{' '}
              <a href="mailto:daniel@ganaderiaregenerativa.com" className="text-primary hover:underline">
                daniel@ganaderiaregenerativa.com
              </a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link
            href="/"
            className="text-primary font-medium hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
