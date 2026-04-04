'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import Link from 'next/link'
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

const countryNames: Record<string, string> = {
  MX: 'México',
  CO: 'Colombia',
  AR: 'Argentina',
  EC: 'Ecuador',
  CR: 'Costa Rica',
  UY: 'Uruguay',
  ES: 'España',
  BO: 'Bolivia',
  GT: 'Guatemala',
  VE: 'Venezuela',
}

function getColor(country: string): string {
  return countryColors[country] || defaultColor
}

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

  // Build legend: count markers per country, show top 10
  const countryCounts: Record<string, number> = {}
  markers.forEach(m => {
    countryCounts[m.country] = (countryCounts[m.country] || 0) + 1
  })
  const legendEntries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <div className="relative h-full w-full">
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
        {markers.map((marker) => {
          const color = getColor(marker.country)
          return (
            <CircleMarker
              key={marker.id}
              center={[marker.latitude, marker.longitude]}
              radius={6}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.7,
                weight: 1,
              }}
            >
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
                  {marker.slug && (
                    <Link
                      href={`/rancho/${marker.slug}`}
                      className="text-xs text-primary hover:underline mt-2 inline-block"
                    >
                      Ver perfil &rarr;
                    </Link>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      {legendEntries.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md px-3 py-2 text-xs">
          <div className="font-semibold text-gray-700 mb-1.5">Países</div>
          <div className="space-y-1">
            {legendEntries.map(([code, count]) => (
              <div key={code} className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getColor(code) }}
                />
                <span className="text-gray-600">
                  {countryNames[code] || code} ({count})
                </span>
              </div>
            ))}
            {Object.keys(countryCounts).length > 10 && (
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: defaultColor }}
                />
                <span className="text-gray-600">Otros</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
