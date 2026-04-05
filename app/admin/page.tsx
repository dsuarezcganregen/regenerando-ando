import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Dashboard — Admin — Regenerando Ando' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: pendientes },
    { count: aprobados },
    { count: rechazados },
    { count: total },
    { count: thisWeek },
    { count: thisMonth },
    { count: incomplete },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pendiente').not('ranch_name', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'aprobado'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'rechazado'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('ranch_name', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true })
      .is('ranch_name', null),
  ])

  // Recent activity
  const { data: recentActivity } = await supabase
    .from('admin_activity_log')
    .select('*, admins!admin_user_id(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pendientes" value={pendientes || 0} color="yellow" href="/admin/perfiles?status=pendiente" />
        <StatCard label="Aprobados" value={aprobados || 0} color="green" href="/admin/perfiles?status=aprobado" />
        <StatCard label="Rechazados" value={rechazados || 0} color="red" href="/admin/perfiles?status=rechazado" />
        <StatCard label="Total" value={total || 0} color="gray" href="/admin/perfiles" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <a href="/admin/perfiles?status=pendiente" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
          <p className="text-2xl font-bold text-primary">{thisWeek || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Nuevos esta semana</p>
        </a>
        <a href="/admin/perfiles" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
          <p className="text-2xl font-bold text-primary">{thisMonth || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Nuevos este mes</p>
        </a>
        <a href="/admin/perfiles?incomplete=1" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
          <p className="text-2xl font-bold text-orange-600">{incomplete || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Perfiles incompletos</p>
        </a>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
          <a href="/admin/actividad" className="text-sm text-primary hover:underline">Ver todo</a>
        </div>
        {recentActivity && recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentActivity.map((entry: any) => (
              <div key={entry.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{entry.admins?.name || 'Admin'}</span>
                    {' — '}
                    {actionLabel(entry.action)}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-md">{entry.details}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {timeAgo(entry.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-400">Sin actividad reciente</div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color, href }: { label: string; value: number; color: string; href: string }) {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  }

  return (
    <a href={href} className={`rounded-xl border p-5 text-center hover:shadow-md transition-all ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1">{label}</p>
    </a>
  )
}

const actionLabels: Record<string, string> = {
  aprobar_perfil: 'aprobó un perfil',
  rechazar_perfil: 'rechazó un perfil',
  revocar_aprobacion: 'revocó aprobación',
  devolver_pendiente: 'devolvió a pendiente',
  editar_perfil: 'editó un perfil',
  eliminar_perfil: 'eliminó un perfil',
  marcar_destacado: 'marcó como destacado',
  agregar_admin: 'agregó un admin',
  quitar_admin: 'quitó un admin',
  cambiar_rol_admin: 'cambió rol de admin',
}

function actionLabel(action: string) {
  return actionLabels[action] || action
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'ahora'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}
