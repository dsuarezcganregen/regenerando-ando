'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

const systemLabels: Record<string, string> = {
  prv: 'PRV', manejo_holistico: 'Manejo Holístico', puad: 'PUAD',
  silvopastoril: 'Silvopastoril', stre: 'STRE', pastoreo_racional: 'Pastoreo Racional', otro: 'Otro',
}

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

export default function MapView({
  markers,
  className = '',
}: {
  markers: MapMarker[]
  className?: string
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={`bg-gray-100 animate-pulse ${className}`} />
  }

  const center: [number, number] = markers.length > 0
    ? [
        markers.reduce((sum, m) => sum + m.latitude, 0) / markers.length,
        markers.reduce((sum, m) => sum + m.longitude, 0) / markers.length,
      ]
    : [20, -40]

  return (
    <MapContainer
      center={center}
      zoom={3}
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.latitude, marker.longitude]}>
          <Popup>
            <div className="min-w-[200px]">
              <h3 className="font-semibold text-sm">{marker.ranch_name}</h3>
              <p className="text-xs text-gray-500">
                {marker.state_province}, {marker.country}
              </p>
              {marker.primary_system && (
                <p className="text-xs mt-1">
                  Sistema: {systemLabels[marker.primary_system] || marker.primary_system}
                </p>
              )}
              {marker.total_hectares && (
                <p className="text-xs">{Number(marker.total_hectares).toLocaleString('es-MX')} ha</p>
              )}
              <Link
                href={`/rancho/${marker.slug}`}
                className="text-xs text-primary hover:underline mt-2 inline-block"
              >
                Ver perfil &rarr;
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
