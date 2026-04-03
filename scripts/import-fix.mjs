import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const SUPABASE_URL = 'https://evwdwvbgwajireocsrku.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('Usage: node import-fix.mjs <service_role_key>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function readCSV(path) {
  const content = readFileSync(path, 'utf-8')
  return parse(content, { columns: true, skip_empty_lines: true, relax_column_count: true })
}

function clean(val) {
  if (val === '' || val === 'nan' || val === 'None' || val === undefined) return null
  return val
}
function cleanNum(val) { const v = clean(val); if (v === null) return null; const n = parseFloat(v); return isNaN(n) ? null : n }
function cleanInt(val) { const v = cleanNum(val); return v === null ? null : Math.round(v) }
function cleanBool(val) { const v = clean(val); if (v === null) return false; return v === 'True' || v === 'true' || v === '1' }

function generateSlug(name) {
  if (!name) return null
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('=== Fix import: inserting missing records one by one ===\n')

  const profiles = readCSV('./migration_profiles.csv')
  const locations = readCSV('./migration_locations.csv')
  const operations = readCSV('./migration_operations.csv')
  const envResults = readCSV('./migration_results_environmental.csv')
  const econResults = readCSV('./migration_results_economic.csv')

  // Build lookup maps
  const locMap = Object.fromEntries(locations.map(r => [r.profile_id, r]))
  const opMap = Object.fromEntries(operations.map(r => [r.profile_id, r]))
  const envMap = Object.fromEntries(envResults.map(r => [r.profile_id, r]))
  const econMap = Object.fromEntries(econResults.map(r => [r.profile_id, r]))

  // Get existing profile IDs
  const { data: existing } = await supabase.from('profiles').select('id, slug')
  const existingIds = new Set(existing?.map(p => p.id) || [])
  const usedSlugs = new Set(existing?.map(p => p.slug).filter(Boolean) || [])

  const missing = profiles.filter(p => !existingIds.has(p.id))
  console.log(`${existing?.length || 0} profiles exist, ${missing.length} missing\n`)

  let inserted = 0
  let errors = 0

  for (const r of missing) {
    let slug = generateSlug(r.ranch_name)
    if (slug && usedSlugs.has(slug)) {
      let counter = 2
      while (usedSlugs.has(`${slug}-${counter}`)) counter++
      slug = `${slug}-${counter}`
    }
    if (slug) usedSlugs.add(slug)

    const profile = {
      id: r.id,
      full_name: r.full_name || 'Sin nombre',
      ranch_name: clean(r.ranch_name),
      slug,
      description: clean(r.description),
      email: r.email || 'sin-email@migrado.com',
      phone: clean(r.phone),
      website: clean(r.website),
      instagram: clean(r.instagram),
      facebook: clean(r.facebook),
      offers_courses: cleanBool(r.offers_courses),
      consent_publish: cleanBool(r.consent_publish),
      status: 'aprobado',
      created_at: clean(r.created_at) || new Date().toISOString(),
    }

    const { error: pErr } = await supabase.from('profiles').insert(profile)
    if (pErr) {
      console.error(`  Profile ${r.full_name}: ${pErr.message}`)
      errors++
      continue
    }

    // Insert location
    const loc = locMap[r.id]
    if (loc) {
      await supabase.from('locations').insert({
        id: loc.id,
        profile_id: r.id,
        country: loc.country || 'XX',
        state_province: loc.state_province || 'Sin dato',
        municipality: clean(loc.municipality),
        locality: clean(loc.locality),
        ecosystem: clean(loc.ecosystem),
        altitude_masl: cleanInt(loc.altitude_masl),
        annual_precipitation_mm: cleanInt(loc.annual_precipitation_mm),
      })
    }

    // Insert operation
    const op = opMap[r.id]
    if (op) {
      await supabase.from('operations').insert({
        id: op.id,
        profile_id: r.id,
        total_hectares: cleanNum(op.total_hectares),
        years_ranching: cleanInt(op.years_ranching),
        years_regenerative: cleanInt(op.years_regenerative),
        primary_system: clean(op.primary_system),
      })
    }

    // Insert env results
    const env = envMap[r.id]
    if (env) {
      await supabase.from('results_environmental').insert({
        id: env.id,
        profile_id: r.id,
        year_reported: cleanInt(env.year_reported) || 2024,
        carrying_capacity_before: cleanNum(env.carrying_capacity_before),
        carrying_capacity_after: cleanNum(env.carrying_capacity_after),
        erosion_reduced: cleanBool(env.erosion_reduced),
        soil_coverage: clean(env.soil_coverage),
        biodiversity_overall: clean(env.biodiversity_overall),
        wildlife_increase: cleanBool(env.wildlife_increase),
        wildlife_indicator_species: clean(env.wildlife_indicator_species),
        agrochemical_reduction_pct: cleanNum(env.agrochemical_reduction_pct),
      })
    }

    // Insert econ results
    const econ = econMap[r.id]
    if (econ) {
      await supabase.from('results_economic').insert({
        id: econ.id,
        profile_id: r.id,
        year_reported: cleanInt(econ.year_reported) || 2024,
        production_change: clean(econ.production_change),
        financial_position_improved: cleanBool(econ.financial_position_improved),
        profitability: clean(econ.profitability),
        work_dynamics: clean(econ.work_dynamics),
        parasite_situation: clean(econ.parasite_situation),
        before_after_narrative: clean(econ.before_after_narrative),
      })
    }

    inserted++
    if (inserted % 50 === 0) console.log(`  Inserted ${inserted}/${missing.length}...`)
  }

  console.log(`\n=== Done: ${inserted} inserted, ${errors} errors ===`)
}

main().catch(console.error)
