'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import SocialLoginButtons from '@/components/SocialLoginButtons'

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-gray-400">Cargando...</span></div>}>
      <RegistroContent />
    </Suspense>
  )
}

function RegistroContent() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [referrerInfo, setReferrerInfo] = useState<{ name: string; ranch: string } | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  // Capture ref code from URL and store in localStorage
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      localStorage.setItem('ra_ref', ref)
      // Validate and show referrer info
      fetch(`/api/invitations/${ref}`)
        .then(r => r.json())
        .then(data => {
          if (data.valid) {
            setReferrerInfo({ name: data.inviterName, ranch: data.inviterRanch })
          }
        })
        .catch(() => {})
    } else {
      // Check if there's a stored ref
      const storedRef = localStorage.getItem('ra_ref')
      if (storedRef) {
        fetch(`/api/invitations/${storedRef}`)
          .then(r => r.json())
          .then(data => {
            if (data.valid) {
              setReferrerInfo({ name: data.inviterName, ranch: data.inviterRanch })
            }
          })
          .catch(() => {})
      }
    }
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Create profile immediately if user is confirmed (email confirmation disabled)
    if (data.user && data.session) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        status: 'pendiente',
      })

      if (profileError && !profileError.message.includes('duplicate')) {
        setError('Error al crear el perfil: ' + profileError.message)
        setLoading(false)
        return
      }

      // Emails are NOT sent here — they are sent when registration is completed
      // (in /registro handleSubmit) to avoid notifying about incomplete profiles

      window.location.href = '/registro'
      return
    }

    // If email confirmation is enabled
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-4xl mb-4">📬</div>
            <h1 className="text-xl font-semibold text-gray-900">Revisa tu email</h1>
            <p className="mt-2 text-gray-600">
              Te enviamos un enlace de confirmación a <strong>{email}</strong>.
              Haz clic en el enlace para activar tu cuenta.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-primary">regenerando</span>
            <span className="text-secondary">ando</span>
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Registra tu rancho</h1>
          <p className="mt-1 text-sm text-gray-500">
            Únete al directorio mundial de ganaderos regenerativos
          </p>
        </div>

        {referrerInfo && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm text-green-800">
              Fuiste invitado por <strong>{referrerInfo.name}</strong>
              {referrerInfo.ranch ? ` de ${referrerInfo.ranch}` : ''}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <SocialLoginButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-400">o con email</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Repite tu contraseña"
            />
          </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta con email'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
