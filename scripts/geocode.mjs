import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://evwdwvbgwajireocsrku.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('Usage: node geocode.mjs <service_role_key>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const countryNames = {
  MX: 'Mexico', CO: 'Colombia', AR: 'Argentina', EC: 'Ecuador',
  CR: 'Costa Rica', UY: 'Uruguay', ES: 'Spain', BO: 'Bolivia',
  GT: 'Guatemala', VE: 'Venezuela', PY: 'Paraguay', CL: 'Chile',
  PA: 'Panama', HN: 'Honduras', PE: 'Peru', NI: 'Nicaragua',
  BR: 'Brazil', US: 'United States', SV: 'El Salvador',
  PT: 'Portugal', ZA: 'South Africa', DO: 'Dominican Republic',
  CU: 'Cuba', AU: 'Australia', NZ: 'New Zealand', KE: 'Kenya', FR: 'France',
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function geocode(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'RegenerandoAndo/1.0 (geocoding migration data)' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (e) {
    // silently fail
  }
  return null
}

async function main() {
  // Get all locations without coordinates
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, profile_id, country, state_province, municipality, locality')
    .is('latitude', null)

  if (error) {
    console.error('Error fetching locations:', error.message)
    return
  }

  console.log(`Found ${locations.length} locations without coordinates\n`)

  let geocoded = 0
  let failed = 0

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i]
    const country = countryNames[loc.country] || loc.country || ''

    // Try most specific first, then fall back
    const queries = []
    if (loc.locality && loc.municipality) {
      queries.push(`${loc.locality}, ${loc.municipality}, ${loc.state_province}, ${country}`)
    }
    if (loc.municipality) {
      queries.push(`${loc.municipality}, ${loc.state_province}, ${country}`)
    }
    queries.push(`${loc.state_province}, ${country}`)

    let result = null
    for (const q of queries) {
      result = await geocode(q)
      if (result) break
      await sleep(1100) // Nominatim rate limit: 1 req/sec
    }

    if (result) {
      const { error: updateError } = await supabase
        .from('locations')
        .update({ latitude: result.lat, longitude: result.lng })
        .eq('id', loc.id)

      if (!updateError) {
        geocoded++
      }
    } else {
      failed++
    }

    // Rate limit: 1 request per second
    await sleep(1100)

    if ((i + 1) % 25 === 0) {
      console.log(`  Progress: ${i + 1}/${locations.length} (${geocoded} geocoded, ${failed} failed)`)
    }
  }

  console.log(`\n=== Done: ${geocoded} geocoded, ${failed} failed out of ${locations.length} ===`)
}

main().catch(console.error)
