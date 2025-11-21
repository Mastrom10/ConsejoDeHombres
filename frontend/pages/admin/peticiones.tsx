import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

type Peticion = {
  id: string;
  titulo: string;
  descripcion: string;
  estadoPeticion: string;
  oculta: boolean;
  autor: { displayName: string; email: string };
};

const estadosPeticion = ['en_revision', 'aprobada', 'no_aprobada', 'cerrada'];

export default function AdminPeticionesPage() {
  const [peticiones, setPeticiones] = useState<Peticion[]>([]);
  const [selected, setSelected] = useState<Peticion | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  const loadPeticiones = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/peticiones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeticiones(data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar las peticiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeticiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selected) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/peticiones/${selected.id}`,
        {
          titulo: selected.titulo,
          descripcion: selected.descripcion,
          estadoPeticion: selected.estadoPeticion,
          oculta: selected.oculta
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelected(null);
      loadPeticiones();
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo actualizar la petición');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Eliminar esta petición y sus dependencias?')) return;
    setSubmitting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/peticiones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selected?.id === id) setSelected(null);
      loadPeticiones();
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo eliminar la petición');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Peticiones" description="Revisión, edición y eliminación de mociones presentadas.">
      <div className="p-6 space-y-6">
        {error && <div className="text-red-400 bg-red-500/10 border border-red-500/40 p-3 rounded">{error}</div>}

        {selected && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 bg-surface/60 border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Editando petición</h3>
              <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
                Cancelar
              </button>
            </div>
            <input
              className="input"
              value={selected.titulo}
              onChange={(e) => setSelected({ ...selected, titulo: e.target.value })}
              required
            />
            <textarea
              className="input min-h-[120px]"
              value={selected.descripcion}
              onChange={(e) => setSelected({ ...selected, descripcion: e.target.value })}
              required
            />
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.oculta}
                  onChange={(e) => setSelected({ ...selected, oculta: e.target.checked })}
                />
                Ocultar a la comunidad
              </label>
              <select
                className="input"
                value={selected.estadoPeticion}
                onChange={(e) => setSelected({ ...selected, estadoPeticion: e.target.value })}
              >
                {estadosPeticion.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Actualizar petición'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-secondary">Cargando peticiones...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left uppercase tracking-[0.25em] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 pr-4">Título</th>
                  <th className="py-3 pr-4">Autor</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Oculta</th>
                  <th className="py-3 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {peticiones.map((p) => (
                  <tr key={p.id} className="border-b border-slate-800/70">
                    <td className="py-3 pr-4 font-bold">{p.titulo}</td>
                    <td className="py-3 pr-4 text-secondary">{p.autor.displayName}</td>
                    <td className="py-3 pr-4 uppercase text-xs">{p.estadoPeticion}</td>
                    <td className="py-3 pr-4">{p.oculta ? 'Sí' : 'No'}</td>
                    <td className="py-3 pr-4 flex gap-2">
                      <button className="btn btn-secondary px-3 py-1" onClick={() => setSelected(p)}>
                        Editar
                      </button>
                      <button className="btn bg-red-500/20 border border-red-500/60 text-red-200 px-3 py-1" onClick={() => handleDelete(p.id)}>
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
