import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const estados = ['miembro_aprobado', 'pendiente_aprobacion', 'rechazado', 'baneado'];
const roles = ['miembro', 'admin', 'moderador'];

type Usuario = {
  id: string;
  email: string;
  displayName: string;
  estadoMiembro: string;
  rol: string;
  createdAt: string;
};

type FormState = {
  email: string;
  password: string;
  displayName: string;
  estadoMiembro: string;
  rol: string;
};

const initialForm: FormState = {
  email: '',
  password: '',
  displayName: '',
  estadoMiembro: 'miembro_aprobado',
  rol: 'miembro'
};

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null), []);

  const loadUsuarios = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
        params: search ? { search } : undefined
      });
      setUsuarios(data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    try {
      if (selectedId) {
        const { password, ...rest } = form;
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/usuarios/${selectedId}`,
          { ...rest, ...(password ? { password } : {}) },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/usuarios`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setForm(initialForm);
      setSelectedId(null);
      loadUsuarios();
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo guardar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: Usuario) => {
    setSelectedId(user.id);
    setForm({
      email: user.email,
      password: '',
      displayName: user.displayName,
      estadoMiembro: user.estadoMiembro,
      rol: user.rol
    });
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('¿Eliminar usuario y sus datos asociados?')) return;
    setSubmitting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (selectedId === id) {
        setSelectedId(null);
        setForm(initialForm);
      }
      loadUsuarios();
    } catch (e: any) {
      setError(e.response?.data?.message || 'No se pudo eliminar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Usuarios"
      description="Alta, baja y modificación de miembros del Consejo."
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p className="text-secondary text-sm">Selecciona para editar o crea un nuevo usuario.</p>
            <input
              type="text"
              placeholder="Buscar por nombre o email"
              className="input mt-2 w-full md:w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-surface/60 border border-slate-700 rounded-lg p-3 text-sm">
            <p className="font-bold">{selectedId ? 'Editando usuario' : 'Crear usuario nuevo'}</p>
            <p className="text-secondary">Campos marcados son obligatorios.</p>
          </div>
        </div>

        {error && <div className="text-red-400 bg-red-500/10 border border-red-500/40 p-3 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface/60 border border-slate-800 rounded-xl p-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">Email</label>
            <input
              type="email"
              className="input w-full"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">Alias</label>
            <input
              type="text"
              className="input w-full"
              required
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">Contraseña</label>
            <input
              type="password"
              className="input w-full"
              placeholder={selectedId ? 'Solo si quieres actualizarla' : 'Obligatoria para crear'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={!selectedId}
              minLength={8}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">Estado</label>
            <select
              className="input"
              value={form.estadoMiembro}
              onChange={(e) => setForm({ ...form, estadoMiembro: e.target.value })}
            >
              {estados.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <label className="block text-xs uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">Rol</label>
            <select
              className="input"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            {selectedId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedId(null);
                  setForm(initialForm);
                }}
              >
                Cancelar edición
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : selectedId ? 'Actualizar' : 'Crear usuario'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-secondary">Cargando usuarios...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left uppercase tracking-[0.25em] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Alias</th>
                  <th className="py-3 pr-4">Rol</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/70">
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">{u.displayName}</td>
                    <td className="py-3 pr-4 uppercase text-xs">{u.rol}</td>
                    <td className="py-3 pr-4 uppercase text-xs">{u.estadoMiembro}</td>
                    <td className="py-3 pr-4 flex gap-2">
                      <button className="btn btn-secondary px-3 py-1" onClick={() => handleEdit(u)}>
                        Editar
                      </button>
                      <button className="btn bg-red-500/20 border border-red-500/60 text-red-200 px-3 py-1" onClick={() => handleDelete(u.id)}>
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
