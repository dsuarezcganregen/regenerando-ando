'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

export default function AdminNavbar({ adminName }: { adminName: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const pathname = usePathname()
  const supabase = createClient()

  // Get user ID for notifications
  if (!userId) {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id)
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const links = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/pendientes', label: 'Perfiles' },
    { href: '/admin/mensajes', label: 'Mensajes' },
    { href: '/admin/admins', label: 'Administradores' },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2 text-lg font-bold">
              <span className="text-primary">regenerando</span>
              <span className="text-secondary">ando</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-1">Admin</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(link.href)
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {userId && <NotificationBell userId={userId} />}
            <span className="text-sm text-gray-400">{adminName}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm ${
                  isActive(link.href)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-400"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
