'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/notifications'

interface Admin {
  id: string
  user_id: string
  name: string
  created_at: string
  email?: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const supabase = createClient()

  useEffect(() => {
    loadAdmins()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAdmins = async () => {
    const { data } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true })

    if (data) {
      // Fetch emails from profiles
      const userIds = data.map((a) => a.user_id)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds)

      const emailMap = new Map(profiles?.map((p) => [p.id, p.email]) || [])
      setAdmins(data.map((a) => ({ ...a, email: emailMap.get(a.user_id) || '' })))
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !name.trim()) return
    setAdding(true)
    setMessage({ type: '', text: '' })

    // We need to find the user by email - but we can't query auth.users from client
    // So we create the admin entry and the user will be linked when they log in
    // For now, we create a placeholder that gets activated on login

    // Try to find user in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim())
      .single()

    if (profile) {
      // User exists, add as admin
      const { error } = await supabase.from('admins').insert({
        user_id: profile.id,
        name: name.trim(),
      })

      if (error) {
        if (error.message.includes('duplicate')) {
          setMessage({ type: 'error', text: 'Este usuario ya es administrador' })
        } else {
          setMessage({ type: 'error', text: error.message })
        }
      } else {
        // Notify the new admin
        await createNotification(
          supabase,
          profile.id,
          'admin_invited',
          'Has sido agregado como administrador',
          'Ahora tienes acceso al panel de administración de Regenerando Ando. Inicia sesión para acceder.',
        )

        setMessage({ type: 'success', text: `${name} agregado como administrador. Se le envió una notificación.` })
        setEmail('')
        setName('')
        await loadAdmins()
      }
    } else {
      setMessage({ type: 'error', text: 'No se encontró un usuario con ese email. El usuario debe tener una cuenta primero.' })
    }

    setAdding(false)
  }

  const handleRemove = async (admin: Admin) => {
    if (admins.length <= 1) {
      alert('No puedes eliminar al último administrador')
      return
    }

    const confirmed = window.confirm(`¿Quitar a ${admin.name} como administrador?`)
    if (!confirmed) return

    await supabase.from('admins').delete().eq('id', admin.id)
    await loadAdmins()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Administradores</h1>

        {/* Current admins */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Admins actuales ({admins.length})</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{admin.name}</p>
                  {admin.email && (
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Desde {new Date(admin.created_at).toLocaleDateString('es-MX')}
                  </p>
                </div>
                {admins.length > 1 && (
                  <button
                    onClick={() => handleRemove(admin)}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add admin */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Agregar administrador</h2>

          {message.text && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del admin
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Nombre completo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email del usuario
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@ejemplo.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <p className="text-xs text-gray-400 mt-1">
                El usuario debe tener una cuenta registrada en la plataforma
              </p>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {adding ? 'Agregando...' : 'Agregar administrador'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
