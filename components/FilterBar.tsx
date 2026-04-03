'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const countries = [
  { code: 'MX', name: 'México' }, { code: 'CO', name: 'Colombia' },
  { code: 'AR', name: 'Argentina' }, { code: 'EC', name: 'Ecuador' },
  { code: 'CR', name: 'Costa Rica' }, { code: 'UY', name: 'Uruguay' },
  { code: 'ES', name: 'España' }, { code: 'BO', name: 'Bolivia' },
  { code: 'GT', name: 'Guatemala' }, { code: 'VE', name: 'Venezuela' },
  { code: 'PY', name: 'Paraguay' }, { code: 'CL', name: 'Chile' },
  { code: 'PA', name: 'Panamá' }, { code: 'HN', name: 'Honduras' },
  { code: 'PE', name: 'Perú' }, { code: 'NI', name: 'Nicaragua' },
  { code: 'BR', name: 'Brasil' }, { code: 'US', name: 'Estados Unidos' },
  { code: 'SV', name: 'El Salvador' }, { code: 'PT', name: 'Portugal' },
  { code: 'ZA', name: 'Sudáfrica' }, { code: 'DO', name: 'Rep. Dominicana' },
  { code: 'CU', name: 'Cuba' }, { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'Nueva Zelanda' }, { code: 'KE', name: 'Kenia' },
  { code: 'FR', name: 'Francia' },
]

const systems = [
  { value: 'prv', label: 'PRV' },
  { value: 'manejo_holistico', label: 'Manejo Holístico' },
  { value: 'puad', label: 'PUAD' },
  { value: 'silvopastoril', label: 'Silvopastoril' },
  { value: 'stre', label: 'STRE' },
  { value: 'pastoreo_racional', label: 'Pastoreo Racional' },
  { value: 'otro', label: 'Otro' },
]

const species = [
  { value: 'bovino', label: 'Bovino' },
  { value: 'bufalino', label: 'Bufalino' },
  { value: 'ovino', label: 'Ovino' },
  { value: 'caprino', label: 'Caprino' },
  { value: 'equino', label: 'Equino' },
  { value: 'porcino', label: 'Porcino' },
  { value: 'gallinas', label: 'Gallinas' },
  { value: 'pollos', label: 'Pollos' },
  { value: 'abejas', label: 'Abejas' },
  { value: 'otro', label: 'Otro' },
]

const businessTypes = [
  { value: 'cria', label: 'Cría' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'engorda', label: 'Engorda' },
  { value: 'cria_desarrollo_engorda', label: 'Cría + Desarrollo + Engorda' },
  { value: 'doble_proposito', label: 'Doble propósito' },
  { value: 'lecheria_especializada', label: 'Lechería especializada' },
  { value: 'otro', label: 'Otro' },
]

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`/directorio?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = () => {
    router.push('/directorio')
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre de rancho..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => {
            const timeout = setTimeout(() => updateFilter('q', e.target.value), 400)
            return () => clearTimeout(timeout)
          }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* Filters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select
          value={searchParams.get('pais') || ''}
          onChange={(e) => updateFilter('pais', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Todos los países</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select
          value={searchParams.get('especie') || ''}
          onChange={(e) => updateFilter('especie', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Todas las especies</option>
          {species.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={searchParams.get('sistema') || ''}
          onChange={(e) => updateFilter('sistema', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Todos los sistemas</option>
          {systems.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={searchParams.get('tipo') || ''}
          onChange={(e) => updateFilter('tipo', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <option value="">Tipo de ganadería</option>
          {businessTypes.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.get('cursos') === '1'}
            onChange={(e) => updateFilter('cursos', e.target.checked ? '1' : '')}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          Ofrece cursos
        </label>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="mt-3 text-sm text-primary hover:underline"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
