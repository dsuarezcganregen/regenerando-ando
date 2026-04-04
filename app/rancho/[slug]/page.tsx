import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import RanchoProfileClient from './RanchoProfileClient'

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
  return {
    title: `${ranch.ranch_name || ranch.full_name} — Ganadería regenerativa en ${country} | Regenerando Ando`,
    description: ranch.description || `Perfil de ${ranch.ranch_name} en Regenerando Ando.`,
  }
}

export default async function RanchoPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params
  const ranch = await getRanch(slug)
  if (!ranch) notFound()

  return <RanchoProfileClient ranch={ranch} countryNames={countryNames} />
}
