'use client'

import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-sm text-gray-500 hover:text-red-600 transition-colors"
    >
      Cerrar sesión
    </button>
  )
}
