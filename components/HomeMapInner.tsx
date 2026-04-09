'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function createCowIcon(color: string): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="24" height="24">
    <path d="M18 33 C18 33 4 20 4 13 C4 5.8 10.3 0.5 18 0.5 C25.7 0.5 32 5.8 32 13 C32 20 18 33 18 33Z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <ellipse cx="18" cy="13" rx="7" ry="6" fill="white"/>
    <ellipse cx="15" cy="11.5" rx="2.5" ry="2" fill="${color}" opacity="0.6"/>
    <ellipse cx="21.5" cy="12.5" rx="2" ry="1.5" fill="${color}" opacity="0.6"/>
    <circle cx="15.5" cy="12" r="1" fill="#333"/>
    <circle cx="20.5" cy="12" r="1" fill="#333"/>
    <ellipse cx="18" cy="15.5" rx="3" ry="1.8" fill="#F5D0C5" stroke="${color}" stroke-width="0.5" opacity="0.8"/>
    <circle cx="17" cy="15.5" r="0.5" fill="${color}" opacity="0.5"/>
    <circle cx="19" cy="15.5" r="0.5" fill="${color}" opacity="0.5"/>
    <ellipse cx="11" cy="8" rx="2.5" ry="1.5" fill="${color}" stroke="white" stroke-width="0.5" transform="rotate(-20 11 8)"/>
    <ellipse cx="25" cy="8" rx="2.5" ry="1.5" fill="${color}" stroke="white" stroke-width="0.5" transform="rotate(20 25 8)"/>
  </svg>`

  return L.divIcon({
    html: svg,
    className: 'cow-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
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

function getColor(country: string): string {
  return countryColors[country] || defaultColor
}

export default function HomeMapInner({ markers }: { markers: { lat: number; lng: number; country: string }[] }) {
  return (
    <MapContainer
      center={[10, -40]}
      zoom={2}
      style={{ height: '350px', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {markers.map((m, i) => {
        const color = getColor(m.country)
        return (
          <Marker
            key={i}
            position={[m.lat, m.lng]}
            icon={createCowIcon(color)}
          />
        )
      })}
    </MapContainer>
  )
}
