import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Solicitud = {
  id: string;
  textoSolicitud: string;
  fotoSolicitudUrl: string;
  estadoSolicitud: string;
  totalAprobaciones: number;
  totalRechazos: number;
  usuario: { displayName: string; avatarUrl?: string; email?: string };
  esVirtual?: boolean;
};

type User = {
  id: string;
  estadoMiembro: string;
};

export default function Solicitudes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [votando, setVotando] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [tipoVoto, setTipoVoto] = useState<Record<string, 'aprobar' | 'rechazar'>>({});

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }

    axios
      .get(`${API}/solicitudes`)
      .then((res) => setSolicitudes(res.data))
      .catch(() => setSolicitudes([]));
  }, [router]);

  const isApproved = user?.estadoMiembro === 'miembro_aprobado';
  const canVote = isApproved;

  const handleVotar = async (solicitudId: string) => {
    if (!canVote || votando) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const voto = tipoVoto[solicitudId];
    const comentario = comentarios[solicitudId];

    if (!voto) {
      alert('Selecciona aprobar o rechazar');
      return;
    }

    if (voto === 'rechazar' && (!comentario || comentario.length < 4)) {
      alert('Comentario obligatorio para rechazar');
      return;
    }

    setVotando(solicitudId);
    try {
      await axios.post(
        `${API}/solicitudes/${solicitudId}/votar`,
        { tipoVoto: voto, mensaje: comentario || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Recargar solicitudes
      const res = await axios.get(`${API}/solicitudes`);
      setSolicitudes(res.data);
      setComentarios({ ...comentarios, [solicitudId]: '' });
      setTipoVoto({ ...tipoVoto, [solicitudId]: 'aprobar' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al votar');
    } finally {
      setVotando(null);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-10 text-slate-100">
          <header className="border-b border-slate-800 pb-6 mb-8">
            <p className="text-xs font-mono text-primary/70 tracking-[0.3em] uppercase mb-2">
              Cámara de Ingreso
            </p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Solicitudes de Adhesión
            </h1>
            <p className="text-sm text-secondary mt-2 max-w-2xl">
              Aquí se listan los aspirantes que buscan ingresar al Consejo. Tu voto ayuda a decidir
              quién se sienta en la mesa.
            </p>
          </header>

          {solicitudes.length === 0 ? (
            <div className="card text-center">
              <h2 className="text-xl font-bold mb-2">Sin solicitudes de ingreso</h2>
              <p className="text-secondary text-sm">
                Por ahora, ningún mortal ha solicitado su ascenso al Consejo.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {solicitudes.map((s) => (
                <article key={s.id} className="card flex flex-col md:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={s.fotoSolicitudUrl || '/img/default-avatar.png'}
                      alt="Solicitud"
                      className="w-32 h-32 object-cover rounded-md border border-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/default-avatar.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Aspirante: {s.usuario.displayName}
                        </h3>
                        {s.usuario.email && (
                          <p className="text-xs text-slate-400">{s.usuario.email}</p>
                        )}
                        <p className="text-xs text-secondary mt-1">
                          Estado: {s.estadoSolicitud.toUpperCase()}
                          {s.esVirtual && (
                            <span className="ml-2 text-amber-400">(Solicitud automática)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-line">
                      {s.textoSolicitud}
                    </p>
                    <div className="flex gap-4 text-xs text-secondary">
                      <span>👍 {s.totalAprobaciones} a favor</span>
                      <span>👎 {s.totalRechazos} en contra</span>
                    </div>

                    {canVote && s.estadoSolicitud === 'pendiente' && (
                      <div className="border-t border-slate-700 pt-4 space-y-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setTipoVoto({ ...tipoVoto, [s.id]: 'aprobar' })}
                            className={`btn flex-1 text-sm ${
                              tipoVoto[s.id] === 'aprobar' ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            👍 Aprobar
                          </button>
                          <button
                            onClick={() => setTipoVoto({ ...tipoVoto, [s.id]: 'rechazar' })}
                            className={`btn flex-1 text-sm ${
                              tipoVoto[s.id] === 'rechazar' ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            👎 Rechazar
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          className="input bg-slate-900/70 text-sm"
                          placeholder={
                            tipoVoto[s.id] === 'rechazar'
                              ? 'Comentario obligatorio para rechazar'
                              : 'Comentario opcional'
                          }
                          value={comentarios[s.id] || ''}
                          onChange={(e) =>
                            setComentarios({ ...comentarios, [s.id]: e.target.value })
                          }
                        />
                        <button
                          onClick={() => handleVotar(s.id)}
                          disabled={votando === s.id || !tipoVoto[s.id] || (tipoVoto[s.id] === 'rechazar' && (!comentarios[s.id] || comentarios[s.id].length < 4))}
                          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {votando === s.id ? 'Enviando...' : 'Enviar voto'}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
