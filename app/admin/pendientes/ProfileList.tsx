'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const systemLabels: Record<string, string> = {
  prv: 'PRV', manejo_holistico: 'Manejo Holístico', puad: 'PUAD',
  silvopastoril: 'Silvopastoril', stre: 'STRE', pastoreo_racional: 'Pastoreo Racional', otro: 'Otro',
}

const countryNames: Record<string, string> = {
  MX: 'México', CO: 'Colombia', AR: 'Argentina', EC: 'Ecuador',
  CR: 'Costa Rica', UY: 'Uruguay', ES: 'España', BO: 'Bolivia',
  GT: 'Guatemala', VE: 'Venezuela', PY: 'Paraguay', CL: 'Chile',
  PA: 'Panamá', HN: 'Honduras', PE: 'Perú', NI: 'Nicaragua',
  BR: 'Brasil', US: 'Estados Unidos', SV: 'El Salvador',
  PT: 'Portugal', ZA: 'Sudáfrica', DO: 'Rep. Dominicana',
  CU: 'Cuba', AU: 'Australia', NZ: 'Nueva Zelanda', KE: 'Kenia', FR: 'Francia',
}

const statusColors: Record<string, string> = {
  pendiente: 'bg-yellow-50 text-yellow-700',
  aprobado: 'bg-green-50 text-green-700',
  rechazado: 'bg-red-50 text-red-700',
}

interface Profile {
  id: string
  full_name: string
  ranch_name: string | null
  email: string
  description: string | null
  status: string
  country: string | null
  state_province: string | null
  primary_system: string | null
  total_hectares: number | null
}

export default function ProfileList({
  profiles,
  currentStatus,
}: {
  profiles: Profile[]
  currentStatus: string
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Filter and sort
  const filtered = profiles
    .filter((p) => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      const countryName = countryNames[p.country || '']?.toLowerCase() || ''
      return (
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.ranch_name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.country || '').toLowerCase().includes(q) ||
        countryName.includes(q) ||
        (p.state_province || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (systemLabels[p.primary_system || ''] || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const nameA = (a.ranch_name || a.full_name || '').toLowerCase()
      const nameB = (b.ranch_name || b.full_name || '').toLowerCase()
      return nameA.localeCompare(nameB, 'es')
    })

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((p) => p.id)))
    }
  }

  const handleBulkAction = async (newStatus: 'aprobado' | 'rechazado' | 'pendiente', bulkReason?: string) => {
    if (selected.size === 0) return
    setLoading(true)

    for (const id of selected) {
      await supabase.rpc('admin_review_profile', {
        target_profile_id: id,
        new_status: newStatus,
        reason: bulkReason || null,
      })
    }

    setSelected(new Set())
    setShowRejectModal(false)
    setReason('')
    setLoading(false)
    router.refresh()
  }

  return (
    <>
      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between sticky top-16 z-40 shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            {selected.size} perfil{selected.size !== 1 ? 'es' : ''} seleccionado{selected.size !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            {currentStatus !== 'aprobado' && (
              <button
                onClick={() => handleBulkAction('aprobado')}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Aprobar seleccionados'}
              </button>
            )}
            {currentStatus !== 'pendiente' && (
              <button
                onClick={() => handleBulkAction('pendiente')}
                disabled={loading}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Regresar a pendiente'}
              </button>
            )}
            {currentStatus !== 'rechazado' && (
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {currentStatus === 'aprobado' ? 'Desaprobar seleccionados' : 'Rechazar seleccionados'}
              </button>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-red-800">
            {currentStatus === 'aprobado' ? 'Desaprobar' : 'Rechazar'} {selected.size} perfil{selected.size !== 1 ? 'es' : ''}
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Escribe el motivo..."
            className="w-full px-4 py-2.5 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('rechazado', reason)}
              disabled={loading || !reason.trim()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Confirmar'}
            </button>
            <button
              onClick={() => { setShowRejectModal(false); setReason('') }}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, rancho, país, estado, sistema..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <p className="text-xs text-gray-400 mt-1">
          {filtered.length} de {profiles.length} perfiles
        </p>
      </div>

      {/* Select all */}
      <div className="mb-3 flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <input
            type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={toggleAll}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Seleccionar todos ({filtered.length})
        </label>
      </div>

      {/* Profile list */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all flex items-start gap-4">
            <input
              type="checkbox"
              checked={selected.has(p.id)}
              onChange={() => toggleSelect(p.id)}
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
            />
            <Link href={`/admin/revisar/${p.id}`} className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{p.ranch_name || p.full_name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {p.full_name} &middot; {countryNames[p.country || ''] || p.country || 'Sin país'}
                    {p.state_province && `, ${p.state_province}`}
                  </p>
                  {p.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.primary_system && (
                      <span className="text-xs bg-hero-bg text-primary px-2 py-1 rounded-full">
                        {systemLabels[p.primary_system] || p.primary_system}
                      </span>
                    )}
                    {p.total_hectares && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {Number(p.total_hectares).toLocaleString('es-MX')} ha
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColors[p.status] || ''}`}>
                  {p.status}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
