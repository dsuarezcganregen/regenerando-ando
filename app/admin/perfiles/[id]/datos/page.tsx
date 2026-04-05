import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AdminDataEditor from './AdminDataEditor'

export default async function AdminDatosPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user.id).single()
  if (!admin) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, ranch_name')
    .eq('id', id)
    .single()

  if (!profile) redirect('/admin/perfiles')

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('profile_id', id)
    .single()

  const { data: operations } = await supabase
    .from('operations')
    .select('*')
    .eq('profile_id', id)
    .single()

  const { data: managementPractices } = await supabase
    .from('management_practices')
    .select('*')
    .eq('profile_id', id)
    .single()

  const { data: resultsEnvironmental } = await supabase
    .from('results_environmental')
    .select('*')
    .eq('profile_id', id)

  const { data: resultsEconomic } = await supabase
    .from('results_economic')
    .select('*')
    .eq('profile_id', id)

  const { data: ranchSpecies } = await supabase
    .from('ranch_species')
    .select('*')
    .eq('profile_id', id)

  return (
    <div className="p-6 sm:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/admin/perfiles/${id}`} className="text-sm text-primary hover:underline">
            &larr; Volver al perfil
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Editar datos completos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {profile.ranch_name || profile.full_name} &mdash; Editor de datos crudos para admin
          </p>
        </div>
      </div>

      <AdminDataEditor
        profileId={id}
        initialLocation={locations}
        initialOperations={operations}
        initialManagement={managementPractices}
        initialEnvResults={resultsEnvironmental || []}
        initialEconResults={resultsEconomic || []}
        initialSpecies={ranchSpecies || []}
      />
    </div>
  )
}
