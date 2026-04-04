'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { logAdminAction } from '@/lib/activity-log'

export default function AdminEditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const profileId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [fullName, setFullName] = useState('')
  const [ranchName, setRanchName] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [totalHectares, setTotalHectares] = useState('')
  const [primarySystem, setPrimarySystem] = useState('')

  useEffect(() => {
    async function load() {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, locations(*), operations(*)')
        .eq('id', profileId)
        .single()

      if (profile) {
        setFullName(profile.full_name || '')
        setRanchName(profile.ranch_name || '')
        setDescription(profile.description || '')
        setEmail(profile.email || '')
        setPhone(profile.phone || '')

        const loc = Array.isArray(profile.locations) ? profile.locations[0] : profile.locations
        if (loc) {
          setCountry(loc.country || '')
          setStateProvince(loc.state_province || '')
        }

        const op = Array.isArray(profile.operations) ? profile.operations[0] : profile.operations
        if (op) {
          setTotalHectares(op.total_hectares?.toString() || '')
          setPrimarySystem(op.primary_system || '')
        }
      }
      setLoading(false)
    }
    load()
  }, [profileId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    await supabase.from('profiles').update({
      full_name: fullName, ranch_name: ranchName || null,
      description: description || null, email, phone: phone || null,
    }).eq('id', profileId)

    if (country && stateProvince) {
      const { data: loc } = await supabase.from('locations').select('id').eq('profile_id', profileId).single()
      const locData = { profile_id: profileId, country, state_province: stateProvince }
      if (loc) await supabase.from('locations').update(locData).eq('profile_id', profileId)
      else await supabase.from('locations').insert(locData)
    }

    if (totalHectares || primarySystem) {
      const { data: op } = await supabase.from('operations').select('id').eq('profile_id', profileId).single()
      const opData = { profile_id: profileId, total_hectares: totalHectares ? parseFloat(totalHectares) : null, primary_system: primarySystem || null }
      if (op) await supabase.from('operations').update(opData).eq('profile_id', profileId)
      else await supabase.from('operations').insert(opData)
    }

    await logAdminAction(supabase, 'editar_perfil', profileId, `Editado: ${ranchName || fullName}`)
    setSaving(false)
    setMessage({ type: 'success', text: 'Perfil actualizado' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar perfil (Admin)</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-primary">&larr; Volver</button>
      </div>

      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Nombre completo" value={fullName} onChange={setFullName} required />
          <Input label="Nombre del rancho" value={ranchName} onChange={setRanchName} />
          <Input label="Email" value={email} onChange={setEmail} type="email" required />
          <Input label="Teléfono" value={phone} onChange={setPhone} />
          <Input label="País" value={country} onChange={setCountry} />
          <Input label="Estado/Provincia" value={stateProvince} onChange={setStateProvince} />
          <Input label="Hectáreas" value={totalHectares} onChange={setTotalHectares} type="number" />
          <Input label="Sistema" value={primarySystem} onChange={setPrimarySystem} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>
        <button type="submit" disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
  )
}
