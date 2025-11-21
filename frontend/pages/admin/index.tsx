import axios from 'axios';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

type DashboardStats = {
  usuarios: { total: number; aprobados: number; pendientes: number; baneados: number; admins: number };
  peticiones: { total: number; porEstado: Record<string, number>; likes: number; votos: number };
  solicitudes: { total: number; porEstado: Record<string, number>; votos: number };
  reportes: { pendientes: number; total: number };
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setRefreshing(true);
    setError('');
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(data);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo obtener el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      description="Métricas en vivo del Consejo, se refrescan cada 60 segundos o bajo demanda."
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm text-secondary">Visibilidad solo para administradores.</p>
            {lastUpdated && <p className="text-xs text-slate-500">Actualizado: {lastUpdated.toLocaleString()}</p>}
          </div>
          <button
            className="btn btn-primary px-4 py-2 text-sm font-bold uppercase tracking-widest"
            onClick={fetchStats}
            disabled={refreshing}
          >
            {refreshing ? 'Actualizando...' : 'Refrescar ahora'}
          </button>
        </div>

        {error && <div className="text-red-400 bg-red-500/10 border border-red-500/40 p-3 rounded">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 bg-slate-800/60 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-bold mb-3">Usuarios</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total" value={stats?.usuarios.total || 0} accent="primary" />
                <MetricCard label="Aprobados" value={stats?.usuarios.aprobados || 0} accent="emerald" />
                <MetricCard label="Pendientes" value={stats?.usuarios.pendientes || 0} accent="amber" />
                <MetricCard label="Baneados" value={stats?.usuarios.baneados || 0} accent="red" />
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-3">Peticiones</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total" value={stats?.peticiones.total || 0} accent="primary" />
                <MetricCard label="Votos" value={stats?.peticiones.votos || 0} accent="cyan" />
                <MetricCard label="Likes" value={stats?.peticiones.likes || 0} accent="pink" />
                <MetricCard label="En revisión" value={stats?.peticiones.porEstado['en_revision'] || 0} accent="amber" />
                <MetricCard label="Aprobadas" value={stats?.peticiones.porEstado['aprobada'] || 0} accent="emerald" />
                <MetricCard label="No aprobadas" value={stats?.peticiones.porEstado['no_aprobada'] || 0} accent="orange" />
                <MetricCard label="Cerradas" value={stats?.peticiones.porEstado['cerrada'] || 0} accent="slate" />
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-3">Solicitudes de miembro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total" value={stats?.solicitudes.total || 0} accent="primary" />
                <MetricCard label="Votos" value={stats?.solicitudes.votos || 0} accent="cyan" />
                <MetricCard label="Pendientes" value={stats?.solicitudes.porEstado['pendiente'] || 0} accent="amber" />
                <MetricCard label="Aprobadas" value={stats?.solicitudes.porEstado['aprobada'] || 0} accent="emerald" />
                <MetricCard label="Rechazadas" value={stats?.solicitudes.porEstado['rechazada'] || 0} accent="red" />
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-3">Reportes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MetricCard label="Pendientes" value={stats?.reportes.pendientes || 0} accent="amber" />
                <MetricCard label="Totales" value={stats?.reportes.total || 0} accent="slate" />
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

type MetricProps = { label: string; value: number; accent: string };

function MetricCard({ label, value, accent }: MetricProps) {
  const accents: Record<string, string> = {
    primary: 'from-cyan-400 to-blue-500 text-black',
    emerald: 'from-emerald-400 to-green-500 text-black',
    amber: 'from-amber-300 to-amber-500 text-black',
    red: 'from-rose-400 to-red-500 text-black',
    cyan: 'from-sky-400 to-cyan-500 text-black',
    pink: 'from-pink-400 to-fuchsia-500 text-black',
    slate: 'from-slate-200 to-slate-400 text-black',
    orange: 'from-orange-300 to-orange-500 text-black'
  };
  return (
    <div className="bg-surface/70 border border-slate-800 rounded-xl p-4 shadow-lg">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">{label}</p>
      <div
        className={`rounded-lg px-3 py-4 text-3xl font-black bg-gradient-to-br ${accents[accent] || accents.primary} shadow-inner`}
      >
        {value}
      </div>
    </div>
  );
}
