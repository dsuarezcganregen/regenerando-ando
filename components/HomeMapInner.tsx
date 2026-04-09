'use client'

import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function createCowIcon(color: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="font-size: 28px; filter: drop-shadow(0 0 4px ${color}) drop-shadow(0 0 10px ${color}); line-height: 1;">🐄</div>`,
    className: 'cow-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
