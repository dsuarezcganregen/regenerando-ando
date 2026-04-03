'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/ChatWindow'

function generateConversationId(userId1: string, userId2: string) {
  return [userId1, userId2].sort().join('-')
}

export default function MensajesGanaderoPage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [adminId, setAdminId] = useState('')
  const [adminName, setAdminName] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)

      // Get the first admin as the contact
      const { data: admins } = await supabase.from('admins').select('user_id, name').limit(1)
      if (admins && admins.length > 0) {
        setAdminId(admins[0].user_id)
        setAdminName(admins[0].name || 'Administrador')
      }

      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!adminId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">No hay administrador disponible para mensajes.</p>
          <Link href="/mi-perfil" className="mt-4 inline-block text-primary hover:underline">
            &larr; Volver
          </Link>
        </div>
      </div>
    )
  }

  const conversationId = generateConversationId(userId, adminId)

  return (
    <div className="bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-gray-900">Mensajes</h1>
          <Link href="/mi-perfil" className="text-sm text-gray-500 hover:text-primary">
            &larr; Volver
          </Link>
        </div>
        <div className="flex-1 mx-4 mb-4 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
          <ChatWindow
            currentUserId={userId}
            otherUserId={adminId}
            otherUserName={adminName}
            conversationId={conversationId}
          />
        </div>
      </div>
    </div>
  )
}
