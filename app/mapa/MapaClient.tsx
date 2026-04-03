'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

interface MapMarker {
  id: string
  ranch_name: string
  slug: string
  description: string | null
  latitude: number
  longitude: number
  country: string
  state_province: string
  total_hectares: number | null
  primary_system: string | null
  head_count: number | null
}

export default function MapaClient({ markers }: { markers: MapMarker[] }) {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <MapView markers={markers} className="h-full w-full" />
    </div>
  )
}
