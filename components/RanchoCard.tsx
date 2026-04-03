import Link from 'next/link'

const systemLabels: Record<string, string> = {
  prv: 'PRV',
  manejo_holistico: 'Manejo Holístico',
  puad: 'PUAD',
  silvopastoril: 'Silvopastoril',
  stre: 'STRE',
  pastoreo_racional: 'Pastoreo Racional',
  otro: 'Otro',
}

const countryNames: Record<string, string> = {
  MX: 'México', CO: 'Colombia', AR: 'Argentina', EC: 'Ecuador',
  CR: 'Costa Rica', UY: 'Uruguay', ES: 'España', BO: 'Bolivia',
  GT: 'Guatemala', VE: 'Venezuela', PY: 'Paraguay', CL: 'Chile',
  PA: 'Panamá', HN: 'Honduras', PE: 'Perú', NI: 'Nicaragua',
  BR: 'Brasil', US: 'Estados Unidos', SV: 'El Salvador',
  PT: 'Portugal', ZA: 'Sudáfrica', DO: 'Rep. Dominicana',
  CU: 'Cuba', AU: 'Australia', NZ: 'Nueva Zelanda', KE: 'Kenia', FR: 'Francia',
}

const ecosystemLabels: Record<string, string> = {
  bosque_tropical_humedo: 'Bosque tropical húmedo',
  bosque_tropical_seco: 'Bosque tropical seco',
  bosque_templado: 'Bosque templado',
  bosque_mesofilo: 'Bosque mesófilo',
  pastizal: 'Pastizal',
  sabana: 'Sabana',
  matorral_xerofilo: 'Matorral xerófilo',
  semidesierto: 'Semidesierto',
  desierto: 'Desierto',
  paramo: 'Páramo',
  sistema_agroforestal: 'Sistema agroforestal',
  humedal: 'Humedal',
  otro: 'Otro',
}

export { systemLabels, countryNames, ecosystemLabels }

interface RanchoCardProps {
  ranch: {
    id: string
    ranch_name: string | null
    slug: string | null
    description: string | null
    logo_url: string | null
    offers_courses: boolean | null
    locations: any
    operations: any
    ranch_species?: any[]
  }
}

export default function RanchoCard({ ranch }: RanchoCardProps) {
  const location = Array.isArray(ranch.locations) ? ranch.locations[0] : ranch.locations
  const operation = Array.isArray(ranch.operations) ? ranch.operations[0] : ranch.operations

  return (
    <Link
      href={`/rancho/${ranch.slug}`}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-hero-bg rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0">
          {ranch.ranch_name?.[0]?.toUpperCase() || 'R'}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {ranch.ranch_name || 'Sin nombre'}
          </h3>
          <p className="text-sm text-gray-500">
            {location?.state_province && `${location.state_province}, `}
            {countryNames[location?.country] || location?.country || ''}
          </p>
        </div>
      </div>

      {ranch.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2 flex-1">
          {ranch.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {operation?.primary_system && (
          <span className="text-xs bg-hero-bg text-primary px-2 py-1 rounded-full">
            {systemLabels[operation.primary_system] || operation.primary_system}
          </span>
        )}
        {location?.ecosystem && (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
            {ecosystemLabels[location.ecosystem] || location.ecosystem}
          </span>
        )}
        {operation?.total_hectares && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {Number(operation.total_hectares).toLocaleString('es-MX')} ha
          </span>
        )}
        {ranch.offers_courses && (
          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
            Ofrece cursos
          </span>
        )}
      </div>
    </Link>
  )
}
