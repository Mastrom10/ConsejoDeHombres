import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type VotoConAutor = {
  id: string;
  tipoVoto: 'aprobar' | 'rechazar';
  mensaje?: string | null;
  fechaVoto: string;
  miembroVotante: { id: string; displayName: string; avatarUrl?: string | null };
  upCount: number;
  downCount: number;
  myReaction: 'up' | 'down' | null;
};

type User = {
  id: string;
  estadoMiembro: string;
};

export default function PeticionDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [peticion, setPeticion] = useState<any>(null);
  const [votos, setVotos] = useState<VotoConAutor[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [voto, setVoto] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [comentario, setComentario] = useState('');
  const [reportando, setReportando] = useState(false);
  const [mensajeReporte, setMensajeReporte] = useState('');
  const [textoReporte, setTextoReporte] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    setIsLoggedIn(true);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }

    axios
      .get(`${API}/peticiones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setPeticion(res.data);
        setVotos(res.data.votos || []);
      })
      .catch(() => setMensaje('No se pudo cargar la petición.'));
  }, [id, router]);

  const isApproved = user?.estadoMiembro === 'miembro_aprobado';
  const canVote = isLoggedIn && isApproved && peticion && user && peticion.autorId !== user.id;
  const canReact = isLoggedIn && isApproved;

  const votar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !canVote) return;
      await axios.post(
        `${API}/peticiones/${id}/votar`,
        { tipoVoto: voto, mensaje: comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Voto registrado correctamente.');
      // Recargar historial de votos
      const res = await axios.get(`${API}/peticiones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeticion(res.data);
      setVotos(res.data.votos || []);
    } catch (e: any) {
      setMensaje(e.response?.data?.message || 'Error al votar');
    }
  };

  const reportar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/peticiones/${id}/reportar`,
        { descripcion: textoReporte || 'Reporte de usuario' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensajeReporte('Reporte enviado. Gracias por mantener la calidad del Consejo.');
      setReportando(false);
      setTextoReporte('');
    } catch (e: any) {
      setMensajeReporte(e.response?.data?.message || 'Error al enviar el reporte.');
    }
  };

  const reaccionar = async (votoId: string, tipo: 'up' | 'down') => {
    if (!canReact) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      await axios.post(
        `${API}/peticiones/${id}/votos/${votoId}/reaccion`,
        { tipo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Recargar historial de votos para reflejar los cambios
      const res = await axios.get(`${API}/peticiones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeticion(res.data);
      setVotos(res.data.votos || []);
    } catch (e) {
      // Silenciar errores de reacción, son secundarios
      console.error(e);
    }
  };

  if (!peticion) return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-12 text-slate-200">Cargando...</div>
    </>
  );

  const porcentaje = Math.round((peticion.totalAprobaciones / Math.max(1, peticion.totalAprobaciones + peticion.totalRechazos)) * 100);

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10 text-slate-100">
        <div className="card space-y-6">
          <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2">{peticion.titulo}</h1>
              <p className="text-sm text-secondary">
                Estado: <span className="font-bold uppercase">{peticion.estadoPeticion}</span> ·{' '}
                <span className={porcentaje >= 70 ? 'text-green-400' : 'text-yellow-400'}>
                  {porcentaje}% aprobación
                </span>
              </p>
            </div>
          </header>

          <p className="text-slate-200 leading-relaxed whitespace-pre-line">{peticion.descripcion}</p>

          {peticion.imagenes?.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {peticion.imagenes.map((img: string) => (
                <img
                  key={img}
                  src={img}
                  className="w-40 h-40 object-cover rounded-xl border border-slate-700"
                  alt=""
                />
              ))}
            </div>
          )}

          {peticion.videoUrl && (
            <div className="mt-4">
              <video
                src={peticion.videoUrl}
                controls
                className="w-full rounded-xl border border-slate-700"
              />
            </div>
          )}

          <section className="border-t border-slate-700 pt-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Tu veredicto</h2>
            {!isApproved && (
              <p className="text-xs text-secondary">
                Solo los miembros aprobados pueden votar sobre esta petición.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <button
                className={`btn ${voto === 'aprobar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => canVote && setVoto('aprobar')}
                disabled={!canVote}
              >
                👍 Aprobar
              </button>
              <button
                className={`btn ${voto === 'rechazar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => canVote && setVoto('rechazar')}
                disabled={!canVote}
              >
                👎 Rechazar
              </button>
            </div>
            <textarea
              rows={3}
              className="input bg-slate-900/70 mt-2"
              placeholder={
                canVote
                  ? 'Comentario (obligatorio si rechazas)'
                  : 'Debes ser miembro aprobado para emitir tu veredicto.'
              }
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={!canVote}
            />
            <button
              className="btn btn-primary w-full md:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={votar}
              disabled={!canVote}
            >
              Enviar voto
            </button>
            {mensaje && (
              <p className="mt-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                {mensaje}
              </p>
            )}
          </section>

          <section className="border-t border-slate-700 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Denunciar esta petición</h2>
              {!reportando && (
                <button
                  className="btn btn-secondary text-sm"
                  onClick={() => {
                    setReportando(true);
                    setMensajeReporte('');
                  }}
                >
                  🚩 Denunciar
                </button>
              )}
            </div>

            {reportando && (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  className="input bg-slate-900/70"
                  placeholder="Describe brevemente por qué consideras inapropiada esta petición"
                  value={textoReporte}
                  onChange={(e) => setTextoReporte(e.target.value)}
                />
                <div className="flex gap-3 justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setReportando(false);
                      setTextoReporte('');
                    }}
                  >
                    Cancelar
                  </button>
                  <button className="btn btn-primary" onClick={reportar}>
                    Enviar reporte
                  </button>
                </div>
              </div>
            )}

            {mensajeReporte && (
              <p className="mt-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                {mensajeReporte}
              </p>
            )}
          </section>

          {/* Historial de votos */}
          <section className="border-t border-slate-700 pt-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Historial de votos</h2>
            {votos.length === 0 && (
              <p className="text-sm text-secondary">
                Aún no hay votos registrados en esta petición.
              </p>
            )}
            <ul className="space-y-3">
              {votos.map((v) => (
                <li
                  key={v.id}
                  className="flex items-start gap-3 bg-slate-900/40 border border-slate-700 rounded-xl px-3 py-2"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-700 flex-shrink-0">
                    {v.miembroVotante.avatarUrl ? (
                      <img
                        src={v.miembroVotante.avatarUrl}
                        alt={v.miembroVotante.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold text-slate-300">
                        {v.miembroVotante.displayName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-100">
                        {v.miembroVotante.displayName}
                      </span>
                      <span
                        className={
                          v.tipoVoto === 'aprobar'
                            ? 'text-xs font-bold text-green-400'
                            : 'text-xs font-bold text-red-400'
                        }
                      >
                        {v.tipoVoto === 'aprobar' ? 'Aprobó' : 'Rechazó'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(v.fechaVoto).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mt-1">
                      {v.mensaje && v.mensaje.trim().length > 0
                        ? v.mensaje
                        : v.tipoVoto === 'aprobar'
                        ? 'Sin comentario adicional (voto a favor).'
                        : 'Sin comentario adicional (voto en contra).'}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                      <button
                        className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                          v.myReaction === 'up'
                            ? 'border-green-500/70 bg-green-500/10 text-green-300'
                            : 'border-slate-600 hover:border-green-500/70 hover:text-green-300'
                        }`}
                        onClick={() => reaccionar(v.id, 'up')}
                        disabled={!canReact}
                      >
                        <span>👍</span>
                        <span>{v.upCount}</span>
                      </button>
                      <button
                        className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                          v.myReaction === 'down'
                            ? 'border-red-500/70 bg-red-500/10 text-red-300'
                            : 'border-slate-600 hover:border-red-500/70 hover:text-red-300'
                        }`}
                        onClick={() => reaccionar(v.id, 'down')}
                        disabled={!canReact}
                      >
                        <span>👎</span>
                        <span>{v.downCount}</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
