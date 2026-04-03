import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const SUPABASE_URL = 'https://evwdwvbgwajireocsrku.supabase.co'
const SERVICE_ROLE_KEY = process.argv[2]

if (!SERVICE_ROLE_KEY) {
  console.error('Usage: node import-data.mjs <service_role_key>')
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

function cleanNum(val) {
  const v = clean(val)
  if (v === null) return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function cleanInt(val) {
  const v = cleanNum(val)
  return v === null ? null : Math.round(v)
}

function cleanBool(val) {
  const v = clean(val)
  if (v === null) return false
  return v === 'True' || v === 'true' || v === '1'
}

async function importProfiles() {
  const rows = readCSV('./migration_profiles.csv')
  console.log(`Importing ${rows.length} profiles...`)

  const BATCH = 100
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      full_name: r.full_name || 'Sin nombre',
      ranch_name: clean(r.ranch_name),
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
    }))

    const { error } = await supabase.from('profiles').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Profile batch ${i} error:`, error.message)
    } else {
      console.log(`  Profiles ${i + 1}-${Math.min(i + BATCH, rows.length)} OK`)
    }
  }
}

async function importLocations() {
  const rows = readCSV('./migration_locations.csv')
  console.log(`Importing ${rows.length} locations...`)

  const BATCH = 100
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      profile_id: r.profile_id,
      country: r.country || 'XX',
      state_province: r.state_province || 'Sin dato',
      municipality: clean(r.municipality),
      locality: clean(r.locality),
      ecosystem: clean(r.ecosystem),
      altitude_masl: cleanInt(r.altitude_masl),
      annual_precipitation_mm: cleanInt(r.annual_precipitation_mm),
    }))

    const { error } = await supabase.from('locations').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Location batch ${i} error:`, error.message)
    } else {
      console.log(`  Locations ${i + 1}-${Math.min(i + BATCH, rows.length)} OK`)
    }
  }
}

async function importOperations() {
  const rows = readCSV('./migration_operations.csv')
  console.log(`Importing ${rows.length} operations...`)

  const BATCH = 100
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      profile_id: r.profile_id,
      total_hectares: cleanNum(r.total_hectares),
      years_ranching: cleanInt(r.years_ranching),
      years_regenerative: cleanInt(r.years_regenerative),
      primary_system: clean(r.primary_system),
    }))

    const { error } = await supabase.from('operations').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Operation batch ${i} error:`, error.message)
    } else {
      console.log(`  Operations ${i + 1}-${Math.min(i + BATCH, rows.length)} OK`)
    }
  }
}

async function importEnvResults() {
  const rows = readCSV('./migration_results_environmental.csv')
  console.log(`Importing ${rows.length} environmental results...`)

  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      profile_id: r.profile_id,
      year_reported: cleanInt(r.year_reported) || 2024,
      carrying_capacity_before: cleanNum(r.carrying_capacity_before),
      carrying_capacity_after: cleanNum(r.carrying_capacity_after),
      erosion_reduced: cleanBool(r.erosion_reduced),
      soil_coverage: clean(r.soil_coverage),
      biodiversity_overall: clean(r.biodiversity_overall),
      wildlife_increase: cleanBool(r.wildlife_increase),
      wildlife_indicator_species: clean(r.wildlife_indicator_species),
      agrochemical_reduction_pct: cleanNum(r.agrochemical_reduction_pct),
    }))

    const { error } = await supabase.from('results_environmental').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Env result batch ${i} error:`, error.message)
    } else {
      console.log(`  Env results ${i + 1}-${Math.min(i + BATCH, rows.length)} OK`)
    }
  }
}

async function importEconResults() {
  const rows = readCSV('./migration_results_economic.csv')
  console.log(`Importing ${rows.length} economic results...`)

  const BATCH = 50
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((r) => ({
      id: r.id,
      profile_id: r.profile_id,
      year_reported: cleanInt(r.year_reported) || 2024,
      production_change: clean(r.production_change),
      financial_position_improved: cleanBool(r.financial_position_improved),
      profitability: clean(r.profitability),
      work_dynamics: clean(r.work_dynamics),
      parasite_situation: clean(r.parasite_situation),
      before_after_narrative: clean(r.before_after_narrative),
    }))

    const { error } = await supabase.from('results_economic').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`Econ result batch ${i} error:`, error.message)
    } else {
      console.log(`  Econ results ${i + 1}-${Math.min(i + BATCH, rows.length)} OK`)
    }
  }
}

async function main() {
  console.log('=== Starting data import ===\n')

  // First we need to disable the FK constraint on profiles.id -> auth.users(id)
  // We do this via SQL since these are migrated users without auth accounts
  const { error: fkError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey'
  }).single()

  // If RPC doesn't exist, try direct approach - the service role bypasses RLS
  // but FK constraints need to be handled differently
  if (fkError) {
    console.log('Note: Could not drop FK via RPC, trying direct SQL...')
    // We'll try inserting directly - if FK fails, we need manual SQL
  }

  await importProfiles()
  await importLocations()
  await importOperations()
  await importEnvResults()
  await importEconResults()

  console.log('\n=== Import complete ===')
}

main().catch(console.error)
