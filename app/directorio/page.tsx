import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import FilterBar from '@/components/FilterBar'
import RanchoCard from '@/components/RanchoCard'
import Link from 'next/link'

const PAGE_SIZE = 12

interface SearchParams {
  q?: string
  pais?: string
  especie?: string
  sistema?: string
  tipo?: string
  cursos?: string
  page?: string
}

async function getRanches(searchParams: SearchParams) {
  const supabase = await createClient()
  const page = parseInt(searchParams.page || '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('profiles')
    .select(`
      id, ranch_name, slug, description, logo_url, offers_courses,
      locations!inner(country, state_province, ecosystem),
      operations!inner(total_hectares, primary_system, head_count, business_type)
    `, { count: 'exact' })
    .eq('status', 'aprobado')
    .eq('consent_publish', true)

  // Filtro por búsqueda de texto
  if (searchParams.q) {
    query = query.ilike('ranch_name', `%${searchParams.q}%`)
  }

  // Filtro por país
  if (searchParams.pais) {
    query = query.eq('locations.country', searchParams.pais)
  }

  // Filtro por sistema
  if (searchParams.sistema) {
    query = query.eq('operations.primary_system', searchParams.sistema)
  }

  // Filtro por tipo de negocio
  if (searchParams.tipo) {
    query = query.eq('operations.business_type', searchParams.tipo)
  }

  // Filtro por cursos
  if (searchParams.cursos === '1') {
    query = query.eq('offers_courses', true)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, count } = await query

  // Filtro por especie (se hace post-query porque es tabla separada)
  let ranches = data || []
  if (searchParams.especie) {
    const { data: speciesProfiles } = await supabase
      .from('ranch_species')
      .select('profile_id')
      .eq('species', searchParams.especie)

    const profileIds = new Set(speciesProfiles?.map((s) => s.profile_id) || [])
    ranches = ranches.filter((r) => profileIds.has(r.id))
  }

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return { ranches, totalPages, currentPage: page, total: count || 0 }
}

export const metadata = {
  title: 'Directorio — Regenerando Ando',
  description: 'Explora el directorio de ganaderos regenerativos de todo el mundo.',
}

export default async function DirectorioPage(props: {
  searchParams: Promise<SearchParams>
}) {
  const searchParams = await props.searchParams
  const { ranches, totalPages, currentPage, total } = await getRanches(searchParams)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Directorio de ganaderos
          </h1>
          <p className="mt-1 text-gray-500">
            {total} ganadero{total !== 1 ? 's' : ''} regenerativo{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 bg-white rounded-xl animate-pulse" />}>
          <FilterBar />
        </Suspense>

        {/* Results */}
        {ranches.length > 0 ? (
          <>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ranches.map((ranch: any) => (
                <RanchoCard key={ranch.id} ranch={ranch} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {currentPage > 1 && (
                  <PaginationLink page={currentPage - 1} searchParams={searchParams} label="&larr; Anterior" />
                )}

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }

                  return (
                    <PaginationLink
                      key={pageNum}
                      page={pageNum}
                      searchParams={searchParams}
                      label={pageNum.toString()}
                      active={pageNum === currentPage}
                    />
                  )
                })}

                {currentPage < totalPages && (
                  <PaginationLink page={currentPage + 1} searchParams={searchParams} label="Siguiente &rarr;" />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron ganaderos con esos filtros.</p>
            <Link href="/directorio" className="mt-4 inline-block text-primary hover:underline">
              Limpiar filtros
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function PaginationLink({
  page,
  searchParams,
  label,
  active = false,
}: {
  page: number
  searchParams: SearchParams
  label: string
  active?: boolean
}) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== 'page') params.set(key, value)
  })
  if (page > 1) params.set('page', page.toString())

  const href = `/directorio${params.toString() ? `?${params.toString()}` : ''}`

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-primary text-white'
          : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
      }`}
      dangerouslySetInnerHTML={{ __html: label }}
    />
  )
}
