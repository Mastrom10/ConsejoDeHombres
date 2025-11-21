import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

type Solicitud = {
  id: string;
  textoSolicitud: string;
  estadoSolicitud: string;
  fechaCreacion: string;
  usuario: { displayName: string; email: string };
};

const estados = ['pendiente', 'aprobada', 'rechazada'];

export default function AdminSolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  const loadSolicitudes = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSolicitudes(data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selected) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/solicitudes/${selected.id}`,
        {
          estadoSolicitud: selected.estadoSolicitud,
          textoSolicitud: selected.textoSolicitud
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelected(null);
      loadSolicitudes();
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo actualizar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Eliminar solicitud de miembro?')) return;
    setSubmitting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/solicitudes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selected?.id === id) setSelected(null);
      loadSolicitudes();
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo eliminar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Solicitudes" description="Gestiona postulaciones y controla su estado.">
      <div className="p-6 space-y-6">
        {error && <div className="text-red-400 bg-red-500/10 border border-red-500/40 p-3 rounded">{error}</div>}

        {selected && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 bg-surface/60 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Editando solicitud</h3>
              <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
                Cancelar
              </button>
            </div>
            <textarea
              className="input min-h-[120px]"
              value={selected.textoSolicitud}
              onChange={(e) => setSelected({ ...selected, textoSolicitud: e.target.value })}
              required
            />
            <select
              className="input"
              value={selected.estadoSolicitud}
              onChange={(e) => setSelected({ ...selected, estadoSolicitud: e.target.value })}
            >
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Actualizar solicitud'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-secondary">Cargando solicitudes...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left uppercase tracking-[0.25em] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 pr-4">Miembro</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Texto</th>
                  <th className="py-3 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((s) => (
                  <tr key={s.id} className="border-b border-slate-800/70">
                    <td className="py-3 pr-4 font-bold">{s.usuario.displayName}</td>
                    <td className="py-3 pr-4 uppercase text-xs">{s.estadoSolicitud}</td>
                    <td className="py-3 pr-4 text-secondary max-w-xl">{s.textoSolicitud}</td>
                    <td className="py-3 pr-4 flex gap-2">
                      <button className="btn btn-secondary px-3 py-1" onClick={() => setSelected(s)}>
                        Editar
                      </button>
                      <button className="btn bg-red-500/20 border border-red-500/60 text-red-200 px-3 py-1" onClick={() => handleDelete(s.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
