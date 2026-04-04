'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Invitation {
  id: string
  invited_name: string | null
  invited_email: string | null
  status: string
  created_at: string
  registered_at: string | null
}

export default function InviteSection() {
  const [personalCode, setPersonalCode] = useState('')
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [registeredCount, setRegisteredCount] = useState(0)
  const [invitedName, setInvitedName] = useState('')
  const [invitedEmail, setInvitedEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadInvitations()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadInvitations() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const res = await fetch('/api/invitations', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      setPersonalCode(data.personalCode || '')
      setInvitations(data.invitations || [])
      setRegisteredCount(data.registeredCount || 0)
    } catch {
      // silent
    }
    setLoading(false)
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSent(false)
    setSending(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setError('Sesión expirada. Recarga la página.')
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ invitedName, invitedEmail }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al enviar')
        setSending(false)
        return
      }

      setSent(true)
      setInvitedName('')
      setInvitedEmail('')
      loadInvitations()
    } catch {
      setError('Error de conexión')
    }
    setSending(false)
  }

  function copyLink() {
    const link = `https://www.regenerandoando.com/auth/registro?ref=${personalCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    const link = `https://www.regenerandoando.com/auth/registro?ref=${personalCode}`
    const text = `¡Registra tu rancho en Regenerando Ando, el directorio mundial de ganaderos regenerativos! ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Share link */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Tu link de invitación</h3>
        <p className="text-sm text-gray-500 mb-4">
          Comparte este enlace con ganaderos regenerativos que conozcas.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={personalCode ? `regenerandoando.com/auth/registro?ref=${personalCode}` : 'Cargando...'}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
          />
          <button
            onClick={copyLink}
            disabled={!personalCode}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={shareWhatsApp}
            disabled={!personalCode}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
        </div>

        {registeredCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-primary text-lg">{registeredCount}</span>{' '}
              {registeredCount === 1 ? 'ganadero se ha registrado' : 'ganaderos se han registrado'} por tu invitación
            </p>
          </div>
        )}
      </div>

      {/* Email invite form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Invitar por email</h3>
        <p className="text-sm text-gray-500 mb-4">
          Envía una invitación directa a un ganadero que conozcas.
        </p>

        {sent && (
          <div className="mb-4 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg">
            ¡Invitación enviada exitosamente!
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSendInvite} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre (opcional)
            </label>
            <input
              type="text"
              value={invitedName}
              onChange={(e) => setInvitedName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Nombre del ganadero"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={invitedEmail}
              onChange={(e) => setInvitedEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="ganadero@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {sending ? 'Enviando...' : 'Enviar invitación'}
          </button>
        </form>
      </div>

      {/* Invitations list */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Invitaciones enviadas</h3>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {inv.invited_name || inv.invited_email}
                  </p>
                  {inv.invited_name && (
                    <p className="text-xs text-gray-500">{inv.invited_email}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  inv.status === 'registered'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {inv.status === 'registered' ? 'Registrado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
