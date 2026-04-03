'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-1 text-xl font-bold">
            <span className="text-primary">regenerando</span>
            <span className="text-secondary">ando</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/directorio" className="text-gray-600 hover:text-primary transition-colors">
              Directorio
            </Link>
            <Link href="/mapa" className="text-gray-600 hover:text-primary transition-colors">
              Mapa
            </Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-primary transition-colors">
              Dashboard
            </Link>
            {user ? (
              <>
                <Link href="/mi-perfil" className="text-gray-600 hover:text-primary transition-colors">
                  Mi Perfil
                </Link>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 text-sm transition-colors">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-primary transition-colors">
                  Ingresar
                </Link>
                <Link href="/auth/registro"
                  className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                  Registrarme
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/directorio" className="block px-3 py-2 text-gray-600 hover:text-primary" onClick={() => setMenuOpen(false)}>
              Directorio
            </Link>
            <Link href="/mapa" className="block px-3 py-2 text-gray-600 hover:text-primary" onClick={() => setMenuOpen(false)}>
              Mapa
            </Link>
            <Link href="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-primary" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            {user ? (
              <>
                <Link href="/mi-perfil" className="block px-3 py-2 text-gray-600 hover:text-primary" onClick={() => setMenuOpen(false)}>
                  Mi Perfil
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-gray-500 hover:text-red-600">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block px-3 py-2 text-gray-600 hover:text-primary" onClick={() => setMenuOpen(false)}>
                  Ingresar
                </Link>
                <Link href="/auth/registro"
                  className="block mx-3 text-center bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark"
                  onClick={() => setMenuOpen(false)}>
                  Registrarme
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
