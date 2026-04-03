'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChatWindow from '@/components/ChatWindow'

interface Conversation {
  userId: string
  name: string
  ranchName: string | null
  lastMessage: string
  lastDate: string
  unread: number
}

function generateConversationId(userId1: string, userId2: string) {
  return [userId1, userId2].sort().join('-')
}

export default function AdminMensajesPage() {
  const [loading, setLoading] = useState(true)
  const [adminId, setAdminId] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: admin } = await supabase.from('admins').select('id').eq('user_id', user.id).single()
      if (!admin) { router.push('/'); return }

      setAdminId(user.id)

      // Get all messages involving this admin
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!messages || messages.length === 0) {
        setLoading(false)
        return
      }

      // Group by conversation partner
      const convMap = new Map<string, { messages: any[] }>()
      for (const msg of messages) {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        if (!convMap.has(partnerId)) {
          convMap.set(partnerId, { messages: [] })
        }
        convMap.get(partnerId)!.messages.push(msg)
      }

      // Get profile names for each partner
      const partnerIds = Array.from(convMap.keys())
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, ranch_name')
        .in('id', partnerIds)

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || [])

      const convList: Conversation[] = partnerIds.map((partnerId) => {
        const conv = convMap.get(partnerId)!
        const profile = profileMap.get(partnerId)
        const lastMsg = conv.messages[0]
        const unread = conv.messages.filter((m: any) => m.recipient_id === user.id && !m.read).length

        return {
          userId: partnerId,
          name: profile?.full_name || 'Usuario',
          ranchName: profile?.ranch_name || null,
          lastMessage: lastMsg.body,
          lastDate: lastMsg.created_at,
          unread,
        }
      })

      // Sort: unread first, then by last message date
      convList.sort((a, b) => {
        if (a.unread > 0 && b.unread === 0) return -1
        if (a.unread === 0 && b.unread > 0) return 1
        return new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
      })

      setConversations(convList)
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'ahora'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="px-4 py-3 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold text-gray-900">Mensajes</h1>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-primary">&larr; Admin</Link>
        </div>

        <div className="flex-1 mx-4 mb-4 flex gap-4 overflow-hidden">
          {/* Conversation list */}
          <div className="w-80 shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Conversaciones</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUser(conv)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selectedUser?.userId === conv.userId ? 'bg-hero-bg/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {conv.ranchName || conv.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{conv.name}</p>
                        <p className="text-xs text-gray-400 mt-1 truncate">{conv.lastMessage}</p>
                      </div>
                      <div className="shrink-0 ml-2 flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">{timeAgo(conv.lastDate)}</span>
                        {conv.unread > 0 && (
                          <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  Sin conversaciones
                </div>
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            {selectedUser ? (
              <ChatWindow
                currentUserId={adminId}
                otherUserId={selectedUser.userId}
                otherUserName={selectedUser.ranchName || selectedUser.name}
                conversationId={generateConversationId(adminId, selectedUser.userId)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Selecciona una conversación
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
