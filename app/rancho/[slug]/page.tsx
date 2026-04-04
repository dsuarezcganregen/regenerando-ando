import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import RanchoProfileClient from './RanchoProfileClient'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const countryNames: Record<string, string> = {
  MX:'México',CO:'Colombia',AR:'Argentina',EC:'Ecuador',CR:'Costa Rica',UY:'Uruguay',
  ES:'España',BO:'Bolivia',GT:'Guatemala',VE:'Venezuela',PY:'Paraguay',CL:'Chile',
  PA:'Panamá',HN:'Honduras',PE:'Perú',NI:'Nicaragua',BR:'Brasil',US:'Estados Unidos',
  SV:'El Salvador',PT:'Portugal',ZA:'Sudáfrica',DO:'Rep. Dominicana',CU:'Cuba',
  AU:'Australia',NZ:'Nueva Zelanda',KE:'Kenia',FR:'Francia',CA:'Canadá',
  DE:'Alemania',GB:'Reino Unido',IT:'Italia',
}

async function getRanch(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select(`*, locations(*), operations(*), ranch_species(*), products(*),
      results_environmental(*), results_economic(*), photos(*)`)
    .eq('slug', slug).eq('status', 'aprobado').eq('consent_publish', true).single()

  if (!data) return null

  const { data: experience } = await supabase
    .from('rancher_experience')
    .select('practices_description, soil_change_observed')
    .eq('profile_id', data.id).single()

  return { ...data, experience }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const ranch = await getRanch(slug)
  if (!ranch) return { title: 'Rancho no encontrado' }
  const loc = Array.isArray(ranch.locations) ? ranch.locations[0] : ranch.locations
  const country = countryNames[loc?.country] || loc?.country || ''
  const title = `${ranch.ranch_name || ranch.full_name} — Ganadería regenerativa en ${country}`
  const description = ranch.description || `Perfil de ${ranch.ranch_name || ranch.full_name} en Regenerando Ando. Ganadería regenerativa en ${country}.`
  const url = `https://www.regenerandoando.com/rancho/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      siteName: 'Regenerando Ando',
      images: ranch.logo_url ? [{ url: ranch.logo_url, width: 400, height: 400, alt: ranch.ranch_name || ranch.full_name }] : undefined,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: ranch.logo_url ? [ranch.logo_url] : undefined,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function RanchoPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const ranch = await getRanch(slug)
  if (!ranch) notFound()

  const loc = Array.isArray(ranch.locations) ? ranch.locations[0] : ranch.locations
  const ops = Array.isArray(ranch.operations) ? ranch.operations[0] : ranch.operations
  const country = countryNames[loc?.country] || loc?.country || ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: ranch.ranch_name || ranch.full_name,
    description: ranch.description || `Ganadería regenerativa en ${country}`,
    url: `https://www.regenerandoando.com/rancho/${slug}`,
    ...(ranch.logo_url && { image: ranch.logo_url }),
    ...(loc?.latitude && loc?.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
    }),
    address: {
      '@type': 'PostalAddress',
      addressCountry: loc?.country || '',
      addressRegion: loc?.state_province || '',
      addressLocality: loc?.municipality || '',
    },
    ...(ranch.website && { sameAs: ranch.website }),
    ...(ops?.total_hectares && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Hectáreas',
        value: ops.total_hectares,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RanchoProfileClient ranch={ranch} countryNames={countryNames} />
    </>
  )
}
