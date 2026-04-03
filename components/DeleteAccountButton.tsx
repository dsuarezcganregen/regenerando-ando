'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteAccountButton({
  userId,
  isAdmin = false,
  userName,
}: {
  userId: string
  isAdmin?: boolean
  userName?: string
}) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [confirmText, setConfirmText] = useState('')
  const supabase = createClient()

  const handleDelete = async () => {
    setStep('deleting')

    const { error } = await supabase.rpc('delete_user_account', {
      target_user_id: userId,
    })

    if (error) {
      alert('Error al eliminar: ' + error.message)
      setStep('idle')
      return
    }

    if (isAdmin) {
      window.location.href = '/admin/pendientes?status=aprobado'
    } else {
      await supabase.auth.signOut()
      window.location.href = '/'
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        className="text-sm text-red-500 hover:text-red-700 transition-colors"
      >
        {isAdmin ? `Eliminar cuenta de ${userName || 'este usuario'}` : 'Eliminar mi cuenta'}
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-red-800">
        {isAdmin
          ? `¿Eliminar la cuenta de ${userName || 'este usuario'}?`
          : '¿Estás seguro de que quieres eliminar tu cuenta?'}
      </p>
      <p className="text-xs text-red-600">
        Esta acción es irreversible. Se eliminará el perfil, fotos, mensajes y todos los datos asociados.
      </p>
      <div>
        <label className="text-xs text-red-700 block mb-1">
          Escribe <strong>ELIMINAR</strong> para confirmar:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="ELIMINAR"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={confirmText !== 'ELIMINAR' || step === 'deleting'}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
        >
          {step === 'deleting' ? 'Eliminando...' : 'Confirmar eliminación'}
        </button>
        <button
          onClick={() => { setStep('idle'); setConfirmText('') }}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
