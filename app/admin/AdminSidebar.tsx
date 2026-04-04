'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/NotificationBell'

interface AdminSidebarProps {
  adminName: string
  adminRole: string
  userId: string
}

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  moderador: 'Moderador',
  editor: 'Editor',
}

export default function AdminSidebar({ adminName, adminRole, userId }: AdminSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const pathname = usePathname()
  const supabase = createClient()
  const isSuperAdmin = adminRole === 'super_admin'

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pendiente')
      .then(({ count }) => setPendingCount(count || 0))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊', show: true },
    { href: '/admin/perfiles', label: 'Perfiles', icon: '👤', show: true, badge: pendingCount },
    { href: '/admin/mensajes', label: 'Mensajes', icon: '💬', show: true },
    { href: '/admin/actividad', label: 'Actividad', icon: '📋', show: true },
    { href: '/admin/equipo', label: 'Equipo', icon: '👥', show: isSuperAdmin },
    { href: '/admin/exportar', label: 'Exportar', icon: '📥', show: isSuperAdmin },
    { href: '/admin/configuracion', label: 'Configuración', icon: '⚙️', show: isSuperAdmin },
  ]

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const navContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <Link href="/admin" className="text-lg font-bold">
          <span className="text-primary">regenerando</span>
          <span className="text-secondary">ando</span>
        </Link>
      </div>

      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-sm font-medium text-white truncate">{adminName}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          adminRole === 'super_admin' ? 'bg-primary/20 text-primary' :
          adminRole === 'moderador' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-700 text-gray-400'
        }`}>
          {roleLabels[adminRole] || adminRole}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.filter(l => l.show).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(link.href)
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>{link.icon}</span>
            <span className="flex-1">{link.label}</span>
            {link.badge ? (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {link.badge > 99 ? '99+' : link.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <div className="px-3 py-1">
          {userId && <NotificationBell userId={userId} />}
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <span>🌐</span>
          <span>Volver al sitio</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
        >
          <span>🚪</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 min-h-screen fixed left-0 top-0 z-40">
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden bg-gray-900 sticky top-0 z-50 flex items-center justify-between px-4 h-14">
        <Link href="/admin" className="text-lg font-bold">
          <span className="text-primary">regenerando</span>
          <span className="text-secondary">ando</span>
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-50 flex flex-col">
            {navContent}
          </aside>
        </>
      )}
    </>
  )
}
