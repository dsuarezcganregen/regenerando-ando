'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Photo {
  id: string
  url: string
  caption: string | null
  is_primary: boolean
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

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `${profileId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('ranch-photos')
        .upload(fileName, file, { upsert: true })

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
    await supabase.storage.from('ranch-photos').remove([photo.url.split('ranch-photos/')[1] || ''])
    await supabase.from('photos').delete().eq('id', photo.id)
    const updated = photos.filter((p) => p.id !== photo.id)
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
              className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              X
            </button>
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
