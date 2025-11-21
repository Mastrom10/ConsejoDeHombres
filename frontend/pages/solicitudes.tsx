import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Solicitud = {
  id: string;
  textoSolicitud: string;
  fotoSolicitudUrl: string;
  cartaSolicitud?: string | null;
  redesSociales?: string | null;
  codigoAceptado?: boolean;
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
  const [miSolicitud, setMiSolicitud] = useState<Solicitud | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr) {
      try {
        const parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
        
        // Cargar mi solicitud si existe
        if (token && parsedUser.estadoMiembro === 'pendiente_aprobacion') {
          axios
            .get(`${API}/solicitudes/me`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then((res) => {
              if (res.data && res.data.estadoSolicitud === 'pendiente') {
                setMiSolicitud(res.data);
              }
            })
            .catch(() => {
              // No hay solicitud o error, es normal
            });
        }
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
      <SEO
        title="Solicitudes de Adhesión"
        description="Revisa las solicitudes de nuevos miembros que desean unirse al Consejo de Hombres. Participa en el proceso de votación y deliberación para aprobar o rechazar solicitudes."
        keywords="solicitudes, adhesión, membresía, consejo de hombres, votación, aprobación"
        url="/solicitudes"
        noindex={true}
      />
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
            {miSolicitud && miSolicitud.estadoSolicitud === 'pendiente' && (
              <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-amber-400 mb-1">Tu solicitud está pendiente</p>
                    <p className="text-xs text-amber-300/70">
                      Puedes modificar tu solicitud mientras esté pendiente de aprobación.
                    </p>
                  </div>
                  <a
                    href="/registro-solicitud"
                    className="btn btn-secondary text-xs px-4 py-2 whitespace-nowrap"
                  >
                    ✏️ Modificar mi Solicitud
                  </a>
                </div>
              </div>
            )}
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
                          {s.codigoAceptado && (
                            <span className="ml-2 text-green-400">✓ Código aceptado</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-2">Presentación:</p>
                      <p className="text-sm text-slate-200 whitespace-pre-line">
                        {s.textoSolicitud}
                      </p>
                    </div>
                    {s.cartaSolicitud && (
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-2">Carta de Solicitud:</p>
                        <p className="text-sm text-slate-200 whitespace-pre-line bg-slate-900/50 p-3 rounded border border-slate-700">
                          {s.cartaSolicitud}
                        </p>
                      </div>
                    )}
                    {s.redesSociales && (
                      <div>
                        <p className="text-sm font-semibold text-slate-300 mb-2">Redes Sociales:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const redes = JSON.parse(s.redesSociales);
                              return Object.entries(redes).map(([red, url]) => (
                                <a
                                  key={red}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:border-primary text-primary hover:text-cyan-300 transition-colors"
                                >
                                  {red.charAt(0).toUpperCase() + red.slice(1)}
                                </a>
                              ));
                            } catch {
                              return null;
                            }
                          })()}
                        </div>
                      </div>
                    )}
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
