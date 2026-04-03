'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

interface LocationPickerProps {
  latitude: string
  longitude: string
  onLocationChange: (lat: string, lng: string) => void
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1 })
  }, [lat, lng, map])
  return null
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null)
  const searchTimeout = useRef<NodeJS.Timeout>(null)

  useEffect(() => { setMounted(true) }, [])

  const lat = latitude ? parseFloat(latitude) : null
  const lng = longitude ? parseFloat(longitude) : null
  const hasMarker = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)

  const handleMapClick = useCallback((clickLat: number, clickLng: number) => {
    onLocationChange(clickLat.toFixed(6), clickLng.toFixed(6))
  }, [onLocationChange])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setResults([])

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&accept-language=es`,
        { headers: { 'User-Agent': 'RegenerandoAndo/1.0' } }
      )
      const data = await res.json()
      setResults(data)
    } catch {
      // silently fail
    }

    setSearching(false)
  }

  const selectResult = (result: any) => {
    const newLat = parseFloat(result.lat)
    const newLng = parseFloat(result.lon)
    onLocationChange(newLat.toFixed(6), newLng.toFixed(6))
    setFlyTarget({ lat: newLat, lng: newLng })
    setResults([])
    setSearchQuery(result.display_name.split(',').slice(0, 3).join(','))
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude
        const newLng = pos.coords.longitude
        onLocationChange(newLat.toFixed(6), newLng.toFixed(6))
        setFlyTarget({ lat: newLat, lng: newLng })
      },
      () => alert('No se pudo obtener tu ubicación')
    )
  }

  const center: [number, number] = hasMarker ? [lat!, lng!] : [20, -99]
  const zoom = hasMarker ? 13 : 3

  if (!mounted) {
    return <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="Busca tu finca, pueblo o zona..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
        >
          {searching ? '...' : 'Buscar'}
        </button>
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-hero-bg transition-colors"
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '300px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleMapClick} />
          {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
          {hasMarker && <Marker position={[lat!, lng!]} />}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {hasMarker
            ? `📍 ${lat!.toFixed(4)}, ${lng!.toFixed(4)} — Haz click en el mapa para ajustar`
            : 'Haz click en el mapa para marcar la ubicación de tu finca'}
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          className="text-xs text-primary hover:underline shrink-0"
        >
          📍 Usar mi ubicación actual
        </button>
      </div>
    </div>
  )
}
