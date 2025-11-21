import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

type Config = {
  minVotosSolicitud: number;
  minVotosPeticion: number;
  porcentajeAprobacion: number;
  maxVotosDisponibles: number;
  minutosRegeneracionVoto: number;
};

export default function AdminConfigPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarConfig = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/config`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConfig(data);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setMensaje('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/config`,
        config,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Configuración guardada correctamente');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error: any) {
      setMensaje(error.response?.data?.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Configuración" description="Ajustes globales del sistema">
        <div className="p-6">Cargando...</div>
      </AdminLayout>
    );
  }

  if (!config) {
    return (
      <AdminLayout title="Configuración" description="Ajustes globales del sistema">
        <div className="p-6 text-red-400">Error al cargar configuración</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Configuración" description="Ajustes globales del sistema">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card space-y-6">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-700 pb-3">
              Reglas de Aprobación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Mínimo de votos para solicitudes
                </label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={config.minVotosSolicitud}
                  onChange={(e) =>
                    setConfig({ ...config, minVotosSolicitud: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Cantidad mínima de votos requeridos para aprobar una solicitud de ingreso
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Mínimo de votos para peticiones
                </label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={config.minVotosPeticion}
                  onChange={(e) =>
                    setConfig({ ...config, minVotosPeticion: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Cantidad mínima de votos requeridos para aprobar una petición
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Porcentaje de aprobación (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={config.porcentajeAprobacion}
                  onChange={(e) =>
                    setConfig({ ...config, porcentajeAprobacion: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Porcentaje mínimo de votos a favor requerido para aprobar
                </p>
              </div>
            </div>
          </div>

          <div className="card space-y-6">
            <h3 className="text-xl font-bold text-slate-100 border-b border-slate-700 pb-3">
              Sistema de Votos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Máximo de votos disponibles
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="input"
                  value={config.maxVotosDisponibles}
                  onChange={(e) =>
                    setConfig({ ...config, maxVotosDisponibles: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Cantidad máxima de votos que un usuario puede tener disponibles
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Minutos para regenerar 1 voto
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="input"
                  value={config.minutosRegeneracionVoto}
                  onChange={(e) =>
                    setConfig({ ...config, minutosRegeneracionVoto: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tiempo en minutos que debe esperar un usuario para regenerar 1 voto
                </p>
              </div>
            </div>
          </div>

          {mensaje && (
            <div
              className={`p-3 rounded ${
                mensaje.includes('correctamente')
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}
            >
              {mensaje}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary min-w-[120px] disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

