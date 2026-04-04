import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold">
              <span className="text-white">regenerando</span>
              <span className="text-secondary">ando</span>
            </Link>
            <p className="mt-3 text-sm text-gray-400">
              El directorio mundial de ganaderos regenerativos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Explora</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/directorio" className="hover:text-white transition-colors">Directorio</Link></li>
              <li><Link href="/mapa" className="hover:text-white transition-colors">Mapa</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://ganaderiaregenerativa.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GanaderiaRegenerativa.com
                </a>
              </li>
              <li>
                <Link href="/auth/registro" className="hover:text-white transition-colors">
                  Registra tu rancho
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <span>&copy; {new Date().getFullYear()} Regenerando Ando — Daniel Suárez</span>
          <Link href="/privacidad" className="hover:text-white transition-colors">
            Política de Privacidad
          </Link>
        </div>
      </div>
    </footer>
  )
}
