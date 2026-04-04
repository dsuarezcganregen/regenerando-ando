'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const countryColors: Record<string, string> = {
  MX: '#0F6E56',
  CO: '#378ADD',
  AR: '#534AB7',
  EC: '#D85A30',
  CR: '#1D9E75',
  UY: '#BA7517',
  ES: '#E24B4A',
  BO: '#D4537E',
  GT: '#639922',
  VE: '#854F0B',
}
const defaultColor = '#888780'

function getColor(country: string): string {
  return countryColors[country] || defaultColor
}

export default function DashboardMiniMap({ markers }: { markers: { lat: number; lng: number; country: string }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />

  return (
    <MapContainer center={[10, -40]} zoom={2} style={{ height: '300px', width: '100%' }}
      zoomControl={false} scrollWheelZoom={false} dragging={false} doubleClickZoom={false}
      className="rounded-lg">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
      {markers.map((m, i) => {
        const color = getColor(m.country)
        return (
          <CircleMarker key={i} center={[m.lat, m.lng]} radius={3}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 1 }} />
        )
      })}
    </MapContainer>
  )
}
