'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  body: string
  read: boolean
  created_at: string
}

interface ChatWindowProps {
  currentUserId: string
  otherUserId: string
  otherUserName: string
  conversationId: string
}

export default function ChatWindow({
  currentUserId,
  otherUserId,
  otherUserName,
  conversationId,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    markAsRead()

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      loadMessages()
    }, 5000)

    return () => clearInterval(interval)
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const markAsRead = async () => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('recipient_id', currentUserId)
      .eq('read', false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    setSending(true)

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      recipient_id: otherUserId,
      body: newMessage.trim(),
    })

    if (error) {
      console.error('Error sending message:', error.message)
      alert('Error al enviar mensaje: ' + error.message)
      setSending(false)
      return
    }

    setNewMessage('')
    setSending(false)
    await loadMessages()
  }

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))

    const time = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 0) return time
    if (diffDays === 1) return `Ayer ${time}`
    return `${d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} ${time}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <h3 className="font-semibold text-gray-900">{otherUserName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            Inicia la conversación enviando un mensaje
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white shrink-0 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}
