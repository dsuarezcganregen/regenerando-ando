'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const MAX_WIDTH = 1600
const MAX_HEIGHT = 1200
const QUALITY = 0.8
const MAX_FILE_SIZE_MB = 10

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If not an image, return as-is
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const img = new window.Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      // Scale down if needed
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Error al comprimir imagen'))
        },
        'image/jpeg',
        QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Error al leer imagen'))
    }

    img.src = url
  })
}

interface Photo {
  id: string
  url: string
  caption: string | null
  is_primary: boolean
  storage_path?: string | null
}

interface PhotoUploaderProps {
  profileId: string
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  maxPhotos?: number
}

export default function PhotoUploader({
  profileId,
  photos,
  onPhotosChange,
  maxPhotos = 6,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (photos.length >= maxPhotos) {
      alert(`Máximo ${maxPhotos} fotos`)
      return
    }

    setUploading(true)

    for (const file of Array.from(files)) {
      if (photos.length >= maxPhotos) break

      // Validate file size
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`La foto "${file.name}" es demasiado grande (máximo ${MAX_FILE_SIZE_MB}MB). Se comprimirá automáticamente.`)
      }

      // Compress image
      let processedFile: Blob
      try {
        processedFile = await compressImage(file)
      } catch {
        continue
      }

      const fileName = `${profileId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

      const { error: uploadError } = await supabase.storage
        .from('ranch-photos')
        .upload(fileName, processedFile, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) {
        console.error('Upload error:', uploadError.message)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ranch-photos')
        .getPublicUrl(fileName)

      const { data: photoRecord, error: insertError } = await supabase
        .from('photos')
        .insert({
          profile_id: profileId,
          storage_path: fileName,
          url: publicUrl,
          is_primary: photos.length === 0,
        })
        .select()
        .single()

      if (!insertError && photoRecord) {
        photos = [...photos, photoRecord]
        onPhotosChange(photos)
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm('¿Eliminar esta foto? Esta acción no se puede deshacer.')) return

    // Prefer storage_path (reliable), fallback to parsing from URL
    const path = photo.storage_path || photo.url.split('ranch-photos/')[1] || ''
    if (path) {
      await supabase.storage.from('ranch-photos').remove([path])
    }
    const { error: delError } = await supabase.from('photos').delete().eq('id', photo.id)
    if (delError) {
      alert('No se pudo eliminar la foto: ' + delError.message)
      return
    }

    const updated = photos.filter((p) => p.id !== photo.id)

    // If we deleted the primary photo and there are others, promote the first one
    if (photo.is_primary && updated.length > 0) {
      const newPrimary = updated[0]
      await supabase.from('photos').update({ is_primary: true }).eq('id', newPrimary.id)
      updated[0] = { ...newPrimary, is_primary: true }
    }

    onPhotosChange(updated)
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
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
              aria-label="Eliminar foto"
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full text-sm font-bold shadow-lg flex items-center justify-center ring-2 ring-white"
            >
              ×
            </button>
            {photo.is_primary && (
              <span className="absolute bottom-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-medium shadow">
                Principal
              </span>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-hero-bg transition-colors">
            <span className="text-2xl text-gray-400">+</span>
            <span className="text-xs text-gray-400 mt-1">
              {uploading ? 'Subiendo...' : 'Agregar foto'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">{photos.length}/{maxPhotos} fotos</p>
    </div>
  )
}
