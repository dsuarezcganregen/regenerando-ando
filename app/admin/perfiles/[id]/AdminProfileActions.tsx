'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createNotification } from '@/lib/notifications'
import { logAdminAction } from '@/lib/activity-log'
import { sendTransactionalEmail } from '@/lib/send-email'

export default function AdminProfileActions({
  profileId, currentStatus, adminRole, isFeatured, profileName,
}: {
  profileId: string; currentStatus: string; adminRole: string; isFeatured: boolean; profileName: string
}) {
  const [loading, setLoading] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showPending, setShowPending] = useState(false)
  const [reason, setReason] = useState('')
  const [pendingReason, setPendingReason] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const canApprove = adminRole === 'super_admin' || adminRole === 'moderador'
  const canDelete = adminRole === 'super_admin'
  const canFeature = adminRole === 'super_admin' || adminRole === 'moderador'

  const doAction = async (newStatus: string, actionReason?: string) => {
    setLoading(true)
    await supabase.rpc('admin_review_profile', { target_profile_id: profileId, new_status: newStatus, reason: actionReason || null })
    const actionMap: Record<string, string> = { aprobado: 'aprobar_perfil', rechazado: 'rechazar_perfil', pendiente: 'devolver_pendiente' }
    const titleMap: Record<string, string> = { aprobado: 'Tu perfil fue aprobado', rechazado: 'Tu perfil fue rechazado', pendiente: 'Tu perfil fue devuelto a revisión' }
    await createNotification(supabase, profileId, `profile_${newStatus === 'aprobado' ? 'approved' : newStatus === 'rechazado' ? 'rejected' : 'pending'}`, titleMap[newStatus], actionReason || '', profileId)
    await logAdminAction(supabase, actionMap[newStatus], profileId, actionReason || `Perfil: ${profileName}`)

    // Send email notification
    if (newStatus === 'aprobado' || newStatus === 'rechazado' || newStatus === 'pendiente') {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          const emailType = newStatus === 'aprobado' ? 'approved' : newStatus === 'rechazado' ? 'rejected' : 'returned_pending'
          await sendTransactionalEmail({
            type: emailType,
            profileId,
            reason: actionReason,
            token: session.access_token,
          })
        }
      } catch {
        // Email is non-blocking
      }
    }
    setLoading(false)
    router.push('/admin/perfiles')
    router.refresh()
  }

  const toggleFeatured = async () => {
    setLoading(true)
    await supabase.from('profiles').update({ is_featured: !isFeatured }).eq('id', profileId)
    await logAdminAction(supabase, 'marcar_destacado', profileId, isFeatured ? 'Quitado de destacados' : 'Marcado como destacado')
    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    setLoading(true)
    await supabase.rpc('delete_user_account', { target_user_id: profileId })
    await logAdminAction(supabase, 'eliminar_perfil', profileId, `Eliminado: ${profileName}`)
    setLoading(false)
    router.push('/admin/perfiles')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Main actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
        <div className="flex flex-wrap gap-3">
          {canApprove && currentStatus !== 'aprobado' && (
            <button onClick={() => doAction('aprobado')} disabled={loading}
              className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
              Aprobar
            </button>
          )}
          {canApprove && currentStatus !== 'pendiente' && (
            <button onClick={() => { setShowPending(!showPending); setShowReject(false) }} disabled={loading}
              className="bg-yellow-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50">
              A pendiente
            </button>
          )}
          {canApprove && currentStatus !== 'rechazado' && (
            <button onClick={() => { setShowReject(!showReject); setShowPending(false) }} disabled={loading}
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              Rechazar
            </button>
          )}
          {canFeature && (
            <button onClick={toggleFeatured} disabled={loading}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                isFeatured ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-400'
              }`}>
              {isFeatured ? '⭐ Destacado' : '☆ Marcar destacado'}
            </button>
          )}
        </div>

        {showPending && (
          <div className="mt-4 space-y-3">
            <textarea value={pendingReason} onChange={(e) => setPendingReason(e.target.value)} rows={3} placeholder="Motivo (opcional) — ej: Falta información de ubicación, fotos, etc."
              className="w-full px-4 py-2.5 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300" />
            <button onClick={() => { doAction('pendiente', pendingReason); setShowPending(false) }} disabled={loading}
              className="bg-yellow-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50">
              Confirmar devolver a pendiente
            </button>
          </div>
        )}

        {showReject && (
          <div className="mt-4 space-y-3">
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Motivo de rechazo..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300" />
            <button onClick={() => doAction('rechazado', reason)} disabled={loading || !reason.trim()}
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              Confirmar rechazo
            </button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      {canDelete && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-3">Zona peligrosa</h2>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="text-sm text-red-500 hover:text-red-700">
              Eliminar cuenta de {profileName}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-600">Esta acción es irreversible. Se eliminará el perfil y todos sus datos.</p>
              <label className="text-xs text-red-700 block">Escribe <strong>ELIMINAR</strong> para confirmar:</label>
              <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="ELIMINAR"
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm" />
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleteConfirm !== 'ELIMINAR' || loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">Eliminar definitivamente</button>
                <button onClick={() => { setShowDelete(false); setDeleteConfirm('') }}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
