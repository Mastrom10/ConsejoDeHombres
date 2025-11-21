import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import SEO from '../../components/SEO';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type VotoConAutor = {
  id: string;
  tipoVoto: 'aprobar' | 'rechazar' | 'debatir';
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
  const [voto, setVoto] = useState<'aprobar' | 'rechazar' | 'debatir' | null>(null);
  const [comentario, setComentario] = useState('');
  const [miVotoActual, setMiVotoActual] = useState<'aprobar' | 'rechazar' | 'debatir' | null>(null);
  const [reportando, setReportando] = useState(false);
  const [mensajeReporte, setMensajeReporte] = useState('');
  const [textoReporte, setTextoReporte] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    const userStr = localStorage.getItem('user');
    let parsedUser: User | null = null;
    if (userStr) {
      try {
        parsedUser = JSON.parse(userStr);
        setUser(parsedUser);
      } catch {
        setUser(null);
      }
    }

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : undefined;

    axios
      .get(`${API}/peticiones/${id}`, config)
      .then((res) => {
        setPeticion(res.data);
        setVotos(res.data.votos || []);
        // Usar miVoto del backend si existe
        if (res.data.miVoto) {
          setMiVotoActual(res.data.miVoto);
          setVoto(res.data.miVoto);
          // Buscar el mensaje en los votos si existe
          const miVotoCompleto = res.data.votos?.find((v: VotoConAutor) => 
            v.miembroVotante.id === parsedUser?.id && v.tipoVoto === res.data.miVoto
          );
          setComentario(miVotoCompleto?.mensaje || '');
        } else {
          // Si no hay voto, asegurarse de que no haya nada preseleccionado
          setMiVotoActual(null);
          setVoto(null);
          setComentario('');
        }
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
      const response = await axios.post(
        `${API}/peticiones/${id}/votar`,
        { tipoVoto: voto, mensaje: comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje(response.data.actualizado ? 'Voto actualizado correctamente.' : 'Voto registrado correctamente.');
      setMiVotoActual(voto);
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

  // Función para convertir URLs de YouTube/Vimeo a formato embed
  const getVideoEmbedUrl = (url: string): { embedUrl: string; type: 'youtube' | 'vimeo' | 'other' } | null => {
    if (!url) return null;

    // YouTube: varios formatos posibles
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
        type: 'youtube'
      };
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        type: 'vimeo'
      };
    }

    return null;
  };

  const videoEmbed = peticion.videoUrl ? getVideoEmbedUrl(peticion.videoUrl) : null;
  
  const primeraImagen = peticion.imagenes && peticion.imagenes.length > 0 ? peticion.imagenes[0] : null;
  const imagenSEO = primeraImagen || '/img/bannerConsejo.png';

  return (
    <>
      <SEO
        title={peticion.titulo}
        description={peticion.descripcion?.substring(0, 160) || `Petición del Consejo de Hombres: ${peticion.titulo}`}
        keywords={`petición, consejo de hombres, ${peticion.titulo}, votación, deliberación`}
        image={imagenSEO}
        url={`/peticiones/${peticion.id}`}
        type="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: peticion.titulo,
          description: peticion.descripcion?.substring(0, 160) || '',
          author: {
            '@type': 'Person',
            name: peticion.autor?.displayName || 'Anónimo'
          },
          publisher: {
            '@type': 'Organization',
            name: 'El Consejo de Hombres',
            logo: {
              '@type': 'ImageObject',
              url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://elconsejodehombres.net'}/img/bannerConsejo.png`
            }
          },
          datePublished: peticion.createdAt,
          dateModified: peticion.fechaResolucion || peticion.createdAt,
          ...(primeraImagen && {
            image: {
              '@type': 'ImageObject',
              url: primeraImagen
            }
          }),
          ...(peticion.videoUrl && {
            video: {
              '@type': 'VideoObject',
              url: peticion.videoUrl
            }
          })
        }}
      />
      <div className="min-h-screen bg-background">
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
              {videoEmbed ? (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={videoEmbed.embedUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-xl border border-slate-700"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video embebido"
                  />
                </div>
              ) : (
                <video
                  src={peticion.videoUrl}
                  controls
                  className="w-full rounded-xl border border-slate-700"
                />
              )}
            </div>
          )}

          {canVote && (
            <section className="border-t border-slate-700 pt-6 space-y-4">
              <h2 className="text-lg font-bold text-slate-100">Tu veredicto</h2>
              {!isApproved && (
                <p className="text-xs text-secondary">
                  Solo los miembros aprobados pueden votar sobre esta petición.
                </p>
              )}
              {miVotoActual && (
                <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-500/30 rounded-lg px-3 py-2">
                  Ya has {miVotoActual === 'aprobar' ? 'aprobado' : miVotoActual === 'rechazar' ? 'rechazado' : 'comentado'} esta petición. Puedes cambiar tu opinión.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  className={`btn ${voto === 'aprobar' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => canVote && setVoto('aprobar')}
                  disabled={!canVote}
                >
                  👍 {miVotoActual === 'aprobar' ? 'Aprobado' : 'Aprobar'}
                </button>
                <button
                  className={`btn ${voto === 'rechazar' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => canVote && setVoto('rechazar')}
                  disabled={!canVote}
                >
                  👎 {miVotoActual === 'rechazar' ? 'Rechazado' : 'Rechazar'}
                </button>
                <button
                  className={`btn ${voto === 'debatir' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => canVote && setVoto('debatir')}
                  disabled={!canVote}
                  title="Comentar sin votar. Aparecerá en el historial pero no contará como voto."
                >
                  💬 Debatir
                </button>
              </div>
              <textarea
                rows={3}
                className="input bg-slate-900/70 mt-2"
                placeholder={
                  canVote
                    ? voto === 'debatir' 
                      ? 'Escribe tu comentario o argumento (obligatorio)'
                      : voto === 'rechazar'
                      ? 'Comentario (obligatorio si rechazas)'
                      : 'Comentario opcional'
                    : 'Debes ser miembro aprobado para emitir tu veredicto.'
                }
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                disabled={!canVote}
                required={voto === 'rechazar' || voto === 'debatir'}
              />
              <button
                className="btn btn-primary w-full md:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={votar}
                disabled={!canVote || !voto || (voto !== 'aprobar' && (!comentario || comentario.length < 4))}
              >
                {miVotoActual ? 'Actualizar ' : 'Enviar '}{voto === 'debatir' ? 'comentario' : 'voto'}
              </button>
              {mensaje && (
                <p className="mt-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2">
                  {mensaje}
                </p>
              )}
            </section>
          )}

          <section className="border-t border-slate-700 pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Denunciar esta petición</h2>
                <p className="text-xs text-secondary mt-1">
                  Solo para contenido inapropiado o ilegal. No es para rechazar la petición.
                </p>
              </div>
              {!reportando && (
                <div className="relative group">
                  <button
                    className="btn btn-secondary text-xs py-1.5 px-3 opacity-70 hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setReportando(true);
                      setMensajeReporte('');
                    }}
                    title="Denunciar contenido inapropiado o ilegal. Esto no rechaza la petición, solo reporta contenido que viola las reglas del Consejo."
                  >
                    🚩 Denunciar
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <p className="font-semibold text-amber-400 mb-1">⚠️ Denuncia por contenido inapropiado</p>
                    <p>Este botón es para reportar contenido que viola las reglas del Consejo (contenido ilegal, inapropiado, etc.).</p>
                    <p className="mt-2 text-slate-400">No es para rechazar la petición. Para rechazar, usa el botón "Rechazar" en la sección de veredicto.</p>
                  </div>
                </div>
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
                            : v.tipoVoto === 'rechazar'
                            ? 'text-xs font-bold text-red-400'
                            : 'text-xs font-bold text-blue-400'
                        }
                      >
                        {v.tipoVoto === 'aprobar' ? 'Aprobó' : v.tipoVoto === 'rechazar' ? 'Rechazó' : 'Comentó'}
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
                        : v.tipoVoto === 'rechazar'
                        ? 'Sin comentario adicional (voto en contra).'
                        : 'Sin comentario.'}
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
      </div>
    </>
  );
}
