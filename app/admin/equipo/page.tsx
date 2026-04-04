'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createNotification } from '@/lib/notifications'
import { logAdminAction } from '@/lib/activity-log'

interface Admin { id: string; user_id: string; name: string; role: string; created_at: string; email?: string }

const roleLabels: Record<string, string> = { super_admin: 'Super Admin', moderador: 'Moderador', editor: 'Editor' }
const roleColors: Record<string, string> = {
  super_admin: 'bg-primary/10 text-primary', moderador: 'bg-blue-100 text-blue-700', editor: 'bg-gray-100 text-gray-700',
}

export default function EquipoPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('moderador')
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [currentUserId, setCurrentUserId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) setCurrentUserId(data.user.id) })
    loadAdmins()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAdmins = async () => {
    const { data } = await supabase.from('admins').select('*').order('created_at')
    if (data) {
      const ids = data.map(a => a.user_id)
      const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', ids)
      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || [])
      setAdmins(data.map(a => ({ ...a, email: emailMap.get(a.user_id) || '' })))
    }
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setMessage({ type: '', text: '' })
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', email.trim()).single()
    if (!profile) {
      setMessage({ type: 'error', text: 'No se encontró un usuario con ese email.' })
      setAdding(false)
      return
    }
    const { error } = await supabase.from('admins').insert({ user_id: profile.id, name: name.trim(), role })
    if (error) {
      setMessage({ type: 'error', text: error.message.includes('duplicate') ? 'Ya es admin' : error.message })
    } else {
      await createNotification(supabase, profile.id, 'admin_invited', 'Has sido agregado como administrador', `Rol asignado: ${roleLabels[role]}`)
      await logAdminAction(supabase, 'agregar_admin', null, `${name} (${email}) como ${roleLabels[role]}`)
      setMessage({ type: 'success', text: `${name} agregado como ${roleLabels[role]}` })
      setEmail(''); setName(''); setRole('moderador')
      await loadAdmins()
    }
    setAdding(false)
  }

  const changeRole = async (admin: Admin, newRole: string) => {
    await supabase.from('admins').update({ role: newRole }).eq('id', admin.id)
    await logAdminAction(supabase, 'cambiar_rol_admin', null, `${admin.name}: ${roleLabels[admin.role]} → ${roleLabels[newRole]}`)
    await loadAdmins()
  }

  const removeAdmin = async (admin: Admin) => {
    if (admin.user_id === currentUserId) { alert('No puedes quitarte a ti mismo'); return }
    if (admins.length <= 1) { alert('No puedes quitar al último admin'); return }
    if (!confirm(`¿Quitar a ${admin.name} como admin?`)) return
    await supabase.from('admins').delete().eq('id', admin.id)
    await logAdminAction(supabase, 'quitar_admin', null, `Quitado: ${admin.name}`)
    await loadAdmins()
  }

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Equipo de administración</h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100"><h2 className="font-semibold">Administradores ({admins.length})</h2></div>
        <div className="divide-y divide-gray-100">
          {admins.map(admin => (
            <div key={admin.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{admin.name}</p>
                {admin.email && <p className="text-sm text-gray-600">{admin.email}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[admin.role]}`}>{roleLabels[admin.role]}</span>
                  <span className="text-xs text-gray-400">Desde {new Date(admin.created_at).toLocaleDateString('es-MX')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select value={admin.role} onChange={(e) => changeRole(admin, e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="super_admin">Super Admin</option>
                  <option value="moderador">Moderador</option>
                  <option value="editor">Editor</option>
                </select>
                {admin.user_id !== currentUserId && (
                  <button onClick={() => removeAdmin(admin)} className="text-xs text-red-500 hover:text-red-700">Quitar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Agregar administrador</h2>
        {message.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>
        )}
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nombre completo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@ejemplo.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="moderador">Moderador</option>
              <option value="editor">Editor</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <button type="submit" disabled={adding}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
            {adding ? 'Agregando...' : 'Agregar'}
          </button>
        </form>
      </div>
    </div>
  )
}
