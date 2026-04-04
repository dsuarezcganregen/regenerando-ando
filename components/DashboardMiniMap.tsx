'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function DashboardMiniMap({ markers }: { markers: { lat: number; lng: number }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />

  return (
    <MapContainer center={[10, -40]} zoom={2} style={{ height: '300px', width: '100%' }}
      zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false}
      className="rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      {markers.map((m, i) => (
        <CircleMarker key={i} center={[m.lat, m.lng]} radius={3}
          pathOptions={{ color: '#0F6E56', fillColor: '#0F6E56', fillOpacity: 0.7, weight: 1 }} />
      ))}
    </MapContainer>
  )
}
