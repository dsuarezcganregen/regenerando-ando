'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminActions({
  profileId,
  currentStatus,
}: {
  profileId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [reason, setReason] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleApprove = async () => {
    setLoading(true)
    const { error } = await supabase.rpc('admin_review_profile', {
      target_profile_id: profileId,
      new_status: 'aprobado',
      reason: null,
    })

    if (error) {
      alert('Error al aprobar: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/admin/pendientes?status=pendiente')
    router.refresh()
  }

  const handleReject = async () => {
    if (!reason.trim()) {
      alert('Escribe un motivo de rechazo')
      return
    }

    setLoading(true)
    const { error } = await supabase.rpc('admin_review_profile', {
      target_profile_id: profileId,
      new_status: 'rechazado',
      reason: reason.trim(),
    })

    if (error) {
      alert('Error al rechazar: ' + error.message)
      setLoading(false)
      return
    }

    router.push('/admin/pendientes?status=pendiente')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>

      {currentStatus === 'pendiente' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Aprobar'}
            </button>
            <button
              onClick={() => setShowReject(!showReject)}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Rechazar
            </button>
          </div>

          {showReject && (
            <div className="space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Escribe el motivo de rechazo..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
              />
              <button
                onClick={handleReject}
                disabled={loading || !reason.trim()}
                className="w-full bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar rechazo'}
              </button>
            </div>
          )}
        </div>
      )}

      {currentStatus === 'aprobado' && (
        <p className="text-green-700 text-sm">Este perfil ya fue aprobado y es visible públicamente.</p>
      )}

      {currentStatus === 'rechazado' && (
        <div className="space-y-3">
          <p className="text-red-700 text-sm">Este perfil fue rechazado. Puedes aprobarlo si el ganadero corrigió la información.</p>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Aprobar ahora'}
          </button>
        </div>
      )}
    </div>
  )
}
