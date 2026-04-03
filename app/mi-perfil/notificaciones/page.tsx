'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  read: boolean
  created_at: string
  profile_id: string | null
}

const typeIcon: Record<string, string> = {
  profile_approved: '✅',
  profile_rejected: '❌',
  profile_pending: '⏳',
  profile_edited: '📝',
}

export default function NotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (data) setNotifications(data)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'hace un momento'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `hace ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `hace ${days} día${days !== 1 ? 's' : ''}`
    return new Date(date).toLocaleDateString('es-MX')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
            {unread > 0 && (
              <p className="text-sm text-gray-500 mt-1">{unread} sin leer</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {unread > 0 && (
              <button onClick={markAllRead} className="text-sm text-primary hover:underline">
                Marcar todas como leídas
              </button>
            )}
            <Link href="/mi-perfil/preferencias" className="text-sm text-gray-500 hover:text-primary">
              Preferencias
            </Link>
            <Link href="/mi-perfil" className="text-sm text-gray-500 hover:text-primary">
              &larr; Volver
            </Link>
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.read) markAsRead(n.id) }}
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                  !n.read ? 'bg-hero-bg/30' : ''
                }`}
              >
                <span className="text-xl shrink-0">{typeIcon[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔔</p>
            <p>No tienes notificaciones</p>
          </div>
        )}
      </div>
    </div>
  )
}
