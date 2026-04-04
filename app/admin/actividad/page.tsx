import { createClient } from '@/lib/supabase/server'

const actionLabels: Record<string, string> = {
  aprobar_perfil: 'Aprobó perfil', rechazar_perfil: 'Rechazó perfil',
  revocar_aprobacion: 'Revocó aprobación', devolver_pendiente: 'Devolvió a pendiente',
  editar_perfil: 'Editó perfil', eliminar_perfil: 'Eliminó perfil',
  marcar_destacado: 'Marcó/quitó destacado', agregar_admin: 'Agregó admin',
  quitar_admin: 'Quitó admin', cambiar_rol_admin: 'Cambió rol de admin',
}

export const metadata = { title: 'Actividad — Admin' }

export default async function ActividadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user!.id).single()
  const isSuperAdmin = admin?.role === 'super_admin'

  let query = supabase
    .from('admin_activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (!isSuperAdmin) {
    query = query.eq('admin_user_id', user!.id)
  }

  const { data: logs } = await query

  // Get admin names
  const adminIds = [...new Set(logs?.map(l => l.admin_user_id) || [])]
  const { data: admins } = await supabase.from('admins').select('user_id, name').in('user_id', adminIds)
  const nameMap = new Map(admins?.map(a => [a.user_id, a.name]) || [])

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Registro de actividad
        {!isSuperAdmin && <span className="text-sm font-normal text-gray-500 ml-2">(solo tus acciones)</span>}
      </h1>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
              {isSuperAdmin && <th className="text-left px-4 py-3 font-medium text-gray-600">Admin</th>}
              <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs && logs.length > 0 ? logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                {isSuperAdmin && (
                  <td className="px-4 py-3 font-medium text-gray-900">{nameMap.get(log.admin_user_id) || 'Admin'}</td>
                )}
                <td className="px-4 py-3 text-gray-900">
                  {actionLabels[log.action] || log.action}
                  {log.target_profile_id && (
                    <a href={`/admin/perfiles/${log.target_profile_id}`} className="ml-1 text-primary hover:underline text-xs">ver</a>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell truncate max-w-xs">{log.details || '—'}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin actividad registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
