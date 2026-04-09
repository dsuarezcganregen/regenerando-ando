'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import Link from 'next/link'
import 'leaflet/dist/leaflet.css'

function createCowIcon(color: string): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="32" height="32">
    <!-- Shadow -->
    <ellipse cx="18" cy="34" rx="10" ry="2" fill="rgba(0,0,0,0.15)"/>
    <!-- Pin body -->
    <path d="M18 33 C18 33 4 20 4 13 C4 5.8 10.3 0.5 18 0.5 C25.7 0.5 32 5.8 32 13 C32 20 18 33 18 33Z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <!-- Cow face -->
    <ellipse cx="18" cy="13" rx="7" ry="6" fill="white"/>
    <!-- Spots -->
    <ellipse cx="15" cy="11.5" rx="2.5" ry="2" fill="${color}" opacity="0.6"/>
    <ellipse cx="21.5" cy="12.5" rx="2" ry="1.5" fill="${color}" opacity="0.6"/>
    <!-- Eyes -->
    <circle cx="15.5" cy="12" r="1" fill="#333"/>
    <circle cx="20.5" cy="12" r="1" fill="#333"/>
    <!-- Nose/muzzle -->
    <ellipse cx="18" cy="15.5" rx="3" ry="1.8" fill="#F5D0C5" stroke="${color}" stroke-width="0.5" opacity="0.8"/>
    <circle cx="17" cy="15.5" r="0.5" fill="${color}" opacity="0.5"/>
    <circle cx="19" cy="15.5" r="0.5" fill="${color}" opacity="0.5"/>
    <!-- Ears/horns -->
    <ellipse cx="11" cy="8" rx="2.5" ry="1.5" fill="${color}" stroke="white" stroke-width="0.5" transform="rotate(-20 11 8)"/>
    <ellipse cx="25" cy="8" rx="2.5" ry="1.5" fill="${color}" stroke="white" stroke-width="0.5" transform="rotate(20 25 8)"/>
  </svg>`

  return L.divIcon({
    html: svg,
    className: 'cow-marker',
    iconSize: [32, 36],
    iconAnchor: [16, 34],
    popupAnchor: [0, -30],
  })
}

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
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createCowIcon(color)}
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
            </Marker>
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
