'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createNotification } from '@/lib/notifications'
import { logAdminAction } from '@/lib/activity-log'

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
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

interface Props {
  profiles: any[]
  currentStatus: string
  adminRole: string
  totalPages: number
  currentPage: number
  searchParams: Record<string, string | undefined>
}

export default function ProfileListAdmin({ profiles, currentStatus, adminRole, totalPages, currentPage, searchParams }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [reason, setReason] = useState('')
  const [searchInput, setSearchInput] = useState(searchParams.q || '')
  const router = useRouter()
  const supabase = createClient()
  const canApprove = adminRole === 'super_admin' || adminRole === 'moderador'

  const doSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (currentStatus) params.set('status', currentStatus)
    if (searchParams.pais) params.set('pais', searchParams.pais)
    if (searchInput.trim()) params.set('q', searchInput.trim())
    router.push(`/admin/perfiles?${params.toString()}`)
  }, [currentStatus, searchParams.pais, searchInput, router])

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }
  const toggleAll = () => {
    if (selected.size === profiles.length) setSelected(new Set())
    else setSelected(new Set(profiles.map((p) => p.id)))
  }

  const handleBulkAction = async (newStatus: string, bulkReason?: string) => {
    if (selected.size === 0) return
    setLoading(true)
    const actionMap: Record<string, string> = { aprobado: 'aprobar_perfil', rechazado: 'rechazar_perfil', pendiente: 'devolver_pendiente' }
    const titles: Record<string, string> = { aprobado: 'Tu perfil fue aprobado', rechazado: 'Tu perfil fue rechazado', pendiente: 'Tu perfil fue devuelto a revisión' }
    for (const id of selected) {
      await supabase.rpc('admin_review_profile', { target_profile_id: id, new_status: newStatus, reason: bulkReason || null })
      await createNotification(supabase, id, `profile_${newStatus === 'aprobado' ? 'approved' : newStatus === 'rechazado' ? 'rejected' : 'pending'}`, titles[newStatus], bulkReason || '', id)
      await logAdminAction(supabase, actionMap[newStatus], id, bulkReason || null)
    }
    setSelected(new Set())
    setShowRejectModal(false)
    setReason('')
    setLoading(false)
    router.refresh()
  }

  // Build pagination URLs
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (currentStatus) params.set('status', currentStatus)
    if (searchParams.pais) params.set('pais', searchParams.pais)
    if (searchParams.q) params.set('q', searchParams.q)
    if (page > 1) params.set('page', page.toString())
    return `/admin/perfiles?${params.toString()}`
  }

  return (
    <>
      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Buscar por nombre, rancho, país..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button onClick={doSearch} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm hover:bg-primary-dark shrink-0">
          Buscar
        </button>
        {searchParams.q && (
          <button onClick={() => { setSearchInput(''); router.push(`/admin/perfiles${currentStatus ? `?status=${currentStatus}` : ''}`) }}
            className="text-sm text-gray-500 hover:text-primary shrink-0 py-2">
            Limpiar
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && canApprove && (
        <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3 sticky top-14 md:top-0 z-30 shadow-sm">
          <span className="text-sm font-medium text-gray-700">{selected.size} seleccionado{selected.size !== 1 ? 's' : ''}</span>
          <div className="flex flex-wrap gap-2">
            {currentStatus !== 'aprobado' && (
              <button onClick={() => handleBulkAction('aprobado')} disabled={loading}
                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">Aprobar</button>
            )}
            {currentStatus !== 'pendiente' && (
              <button onClick={() => handleBulkAction('pendiente')} disabled={loading}
                className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50">A pendiente</button>
            )}
            {currentStatus !== 'rechazado' && (
              <button onClick={() => setShowRejectModal(true)} disabled={loading}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">Rechazar</button>
            )}
            <button onClick={() => setSelected(new Set())} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="Motivo..."
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('rechazado', reason)} disabled={loading || !reason.trim()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Confirmar</button>
            <button onClick={() => { setShowRejectModal(false); setReason('') }}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Select all */}
      {canApprove && profiles.length > 0 && (
        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input type="checkbox" checked={selected.size === profiles.length && profiles.length > 0} onChange={toggleAll}
              className="rounded border-gray-300 text-primary focus:ring-primary" />
            Seleccionar todos en esta página ({profiles.length})
          </label>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {canApprove && <th className="w-10 px-4 py-3"></th>}
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rancho / Ganadero</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">País</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Sistema</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Hectáreas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  {canApprove && (
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary" />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Link href={`/admin/perfiles/${p.id}`} className="hover:text-primary">
                      <p className="font-medium text-gray-900">{p.ranch_name || 'Sin nombre'}</p>
                      <p className="text-xs text-gray-500">{p.full_name}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{countryNames[p.country] || p.country || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{systemLabels[p.primary_system] || p.primary_system || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{p.total_hectares ? Number(p.total_hectares).toLocaleString('es-MX') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.status] || ''}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No se encontraron perfiles</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-1 flex-wrap">
          {/* Previous */}
          {currentPage > 1 && (
            <Link href={buildPageUrl(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:border-primary">
              &larr;
            </Link>
          )}

          {/* First page */}
          {currentPage > 3 && (
            <>
              <Link href={buildPageUrl(1)} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:border-primary">1</Link>
              {currentPage > 4 && <span className="px-2 text-gray-400">...</span>}
            </>
          )}

          {/* Pages around current */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p >= currentPage - 2 && p <= currentPage + 2)
            .map(p => (
              <Link key={p} href={buildPageUrl(p)}
                className={`px-3 py-1.5 rounded-lg text-sm ${p === currentPage ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
                {p}
              </Link>
            ))}

          {/* Last page */}
          {currentPage < totalPages - 2 && (
            <>
              {currentPage < totalPages - 3 && <span className="px-2 text-gray-400">...</span>}
              <Link href={buildPageUrl(totalPages)} className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:border-primary">{totalPages}</Link>
            </>
          )}

          {/* Next */}
          {currentPage < totalPages && (
            <Link href={buildPageUrl(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-gray-600 hover:border-primary">
              &rarr;
            </Link>
          )}
        </div>
      )}
    </>
  )
}
