'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PreferenciasPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [inApp, setInApp] = useState(true)
  const [statusChange, setStatusChange] = useState(true)
  const [profileEdit, setProfileEdit] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setInApp(data.in_app ?? true)
        setStatusChange(data.notify_status_change ?? true)
        setProfileEdit(data.notify_profile_edit ?? true)
      }

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const prefs = {
      user_id: user.id,
      in_app: inApp,
      notify_status_change: statusChange,
      notify_profile_edit: profileEdit,
    }

    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase.from('notification_preferences').update(prefs).eq('user_id', user.id)
    } else {
      await supabase.from('notification_preferences').insert(prefs)
    }

    setMessage('Preferencias guardadas')
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Preferencias de notificaciones</h1>
          <Link href="/mi-perfil" className="text-sm text-gray-500 hover:text-primary">
            &larr; Volver
          </Link>
        </div>

        {message && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm bg-green-50 text-green-700">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Canal de notificación</h2>
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Notificaciones en la app</p>
                <p className="text-xs text-gray-500">Campana con contador en el menú</p>
              </div>
              <input
                type="checkbox"
                checked={inApp}
                onChange={(e) => setInApp(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
              />
            </label>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Tipos de notificación</h2>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Cambios de estado del perfil</p>
                <p className="text-xs text-gray-500">Cuando tu perfil es aprobado, rechazado o devuelto a pendiente</p>
              </div>
              <input
                type="checkbox"
                checked={statusChange}
                onChange={(e) => setStatusChange(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between py-2 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-700">Ediciones de perfiles (admin)</p>
                <p className="text-xs text-gray-500">Cuando un ganadero edita un perfil pendiente o rechazado</p>
              </div>
              <input
                type="checkbox"
                checked={profileEdit}
                onChange={(e) => setProfileEdit(e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5"
              />
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar preferencias'}
          </button>
        </div>
      </div>
    </div>
  )
}
