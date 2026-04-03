import { createClient } from '@/lib/supabase/server'
import MapaClient from './MapaClient'

async function getMarkers() {
  const supabase = await createClient()
  const { data } = await supabase.from('map_markers').select('*')
  return data || []
}

export const metadata = {
  title: 'Mapa — Regenerando Ando',
  description: 'Mapa interactivo de ganaderos regenerativos en el mundo.',
}

export default async function MapaPage() {
  const markers = await getMarkers()
  return <MapaClient markers={markers} />
}
