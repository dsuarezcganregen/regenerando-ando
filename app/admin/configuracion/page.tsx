'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logAdminAction } from '@/lib/activity-log'

export default function ConfiguracionPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [newCode, setNewCode] = useState('')
  const [newNameEs, setNewNameEs] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const supabase = createClient()

  useEffect(() => {
    loadCountries()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCountries = async () => {
    const { data } = await supabase.from('countries').select('*').order('name_es')
    if (data) setCountries(data)
    setLoading(false)
  }

  const addCountry = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    if (!newCode.trim() || !newNameEs.trim()) return

    const { error } = await supabase.from('countries').insert({
      code: newCode.toUpperCase().trim(),
      name_es: newNameEs.trim(),
      name_en: newNameEn.trim() || null,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message.includes('duplicate') ? 'Ese código ya existe' : error.message })
    } else {
      await logAdminAction(supabase, 'configuracion', null, `País agregado: ${newNameEs} (${newCode.toUpperCase()})`)
      setMessage({ type: 'success', text: `${newNameEs} agregado` })
      setNewCode(''); setNewNameEs(''); setNewNameEn('')
      await loadCountries()
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Cargando...</div>

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>

      {/* Countries */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Catálogo de países ({countries.length})</h2>

        <div className="max-h-64 overflow-y-auto mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {countries.map((c) => (
              <div key={c.code} className="text-sm px-3 py-1.5 bg-gray-50 rounded-lg">
                <span className="font-medium">{c.code}</span> — {c.name_es}
              </div>
            ))}
          </div>
        </div>

        {message.text && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={addCountry} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Código ISO</label>
            <input type="text" value={newCode} onChange={(e) => setNewCode(e.target.value)} maxLength={3} placeholder="XX" required
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre (español)</label>
            <input type="text" value={newNameEs} onChange={(e) => setNewNameEs(e.target.value)} placeholder="País" required
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre (inglés)</label>
            <input type="text" value={newNameEn} onChange={(e) => setNewNameEn(e.target.value)} placeholder="Country"
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark">
            Agregar
          </button>
        </form>
      </div>

      {/* System info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Información del sistema</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Sistemas:</strong> PRV, Manejo Holístico, PUAD, Silvopastoril, STRE, Pastoreo Racional, Otro</p>
          <p><strong>Especies:</strong> Bovino, Bufalino, Ovino, Caprino, Equino, Porcino, Gallinas, Pollos, Abejas, Otro</p>
          <p><strong>Tipos negocio:</strong> Cría, Desarrollo, Engorda, Cría+Desarrollo+Engorda, Doble propósito, Lechería especializada, Otro</p>
          <p className="text-xs text-gray-400 mt-3">
            Los valores de sistemas, especies y tipos de negocio son ENUMs de PostgreSQL. Para modificarlos se requiere una migración de base de datos.
          </p>
        </div>
      </div>
    </div>
  )
}
