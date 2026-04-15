'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Photo {
  id: string
  url: string
  caption: string | null
  is_primary: boolean
  storage_path?: string | null
}

export default function AdminPhotosSection({ initialPhotos }: { initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (photo: Photo) => {
    if (!confirm('¿Eliminar esta foto? Esta acción no se puede deshacer.')) return
    setDeletingId(photo.id)

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Sesión expirada. Vuelve a iniciar sesión.')
        return
      }

      const res = await fetch(`/api/admin/photos/${photo.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error al eliminar' }))
        alert('No se pudo eliminar la foto: ' + error)
        return
      }

      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    } finally {
      setDeletingId(null)
    }
  }

  if (photos.length === 0) {
    return <p className="text-sm text-gray-400">Este perfil no tiene fotos.</p>
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={photo.url}
              alt={photo.caption || 'Foto del rancho'}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              disabled={deletingId === photo.id}
              aria-label="Eliminar foto"
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white w-8 h-8 rounded-full text-sm font-bold shadow-lg flex items-center justify-center ring-2 ring-white"
            >
              {deletingId === photo.id ? '…' : '×'}
            </button>
            {photo.is_primary && (
              <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow">
                Principal
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">{photos.length} foto{photos.length !== 1 ? 's' : ''}</p>
    </div>
  )
}
