'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ExportarPage() {
  const [loading, setLoading] = useState('')
  const supabase = createClient()

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) { alert('No hay datos para exportar'); return }
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => {
        const val = row[h]
        if (val === null || val === undefined) return ''
        const str = String(val).replace(/"/g, '""')
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str
      }).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const exportProfiles = async (country?: string) => {
    setLoading(country || 'all')

    let query = supabase
      .from('admin_pending_reviews')
      .select('*')
      .eq('status', 'aprobado')

    if (country) {
      query = query.eq('country', country)
    }

    const { data } = await query
    if (data) {
      const flat = data.map((p: any) => ({
        nombre: p.full_name,
        rancho: p.ranch_name,
        email: p.email,
        telefono: p.phone,
        descripcion: p.description,
        pais: p.country,
        estado: p.state_province,
        municipio: p.municipality,
        latitud: p.latitude,
        longitud: p.longitude,
        ecosistema: p.ecosystem,
        hectareas: p.total_hectares,
        sistema: p.primary_system,
        tipo_negocio: p.business_type,
        anios_regenerativo: p.years_regenerative,
        fecha_registro: p.created_at,
      }))
      downloadCSV(flat, country ? `perfiles_${country}.csv` : 'perfiles_aprobados.csv')
    }
    setLoading('')
  }

  const exportAnonymized = async () => {
    setLoading('anon')
    const { data } = await supabase
      .from('admin_pending_reviews')
      .select('*')
      .eq('status', 'aprobado')

    if (data) {
      const flat = data.map((p: any) => ({
        pais: p.country,
        estado: p.state_province,
        municipio: p.municipality,
        ecosistema: p.ecosystem,
        latitud: p.latitude,
        longitud: p.longitude,
        hectareas: p.total_hectares,
        sistema: p.primary_system,
        tipo_negocio: p.business_type,
        anios_regenerativo: p.years_regenerative,
        fecha_registro: p.created_at,
      }))
      downloadCSV(flat, 'datos_anonimizados.csv')
    }
    setLoading('')
  }

  const exportResults = async () => {
    setLoading('results')
    const { data: env } = await supabase.from('results_environmental').select('*')
    const { data: econ } = await supabase.from('results_economic').select('*')
    if (env) downloadCSV(env, 'resultados_ambientales.csv')
    if (econ) downloadCSV(econ, 'resultados_economicos.csv')
    setLoading('')
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Exportar datos</h1>

      <div className="space-y-4">
        <ExportCard title="Todos los perfiles aprobados" description="Incluye datos personales, ubicación y operación"
          onClick={() => exportProfiles()} loading={loading === 'all'} />

        <ExportCard title="Perfiles por país" description="Selecciona un país para exportar sus perfiles"
          onClick={() => {
            const country = prompt('Código de país (ej: MX, CO, AR):')
            if (country) exportProfiles(country.toUpperCase())
          }} loading={false} />

        <ExportCard title="Datos anonimizados" description="Sin nombres, emails ni teléfonos. Para investigación."
          onClick={exportAnonymized} loading={loading === 'anon'} />

        <ExportCard title="Resultados ambientales y económicos" description="Exporta ambos archivos CSV"
          onClick={exportResults} loading={loading === 'results'} />
      </div>
    </div>
  )
}

function ExportCard({ title, description, onClick, loading }: {
  title: string; description: string; onClick: () => void; loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button onClick={onClick} disabled={loading}
        className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 shrink-0">
        {loading ? 'Exportando...' : 'Descargar CSV'}
      </button>
    </div>
  )
}
