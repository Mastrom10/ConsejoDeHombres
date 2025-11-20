import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PeticionDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [peticion, setPeticion] = useState<any>(null);
  const [mensaje, setMensaje] = useState('');
  const [voto, setVoto] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [comentario, setComentario] = useState('');
  const [reportando, setReportando] = useState(false);
  const [mensajeReporte, setMensajeReporte] = useState('');
  const [textoReporte, setTextoReporte] = useState('');

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API}/peticiones`, { params: { id } })
      .then((res) => {
        const match = Array.isArray(res.data) ? res.data.find((p: any) => p.id === id) : res.data;
        setPeticion(match);
      })
      .catch(() => setMensaje('No se pudo cargar la petición.'));
  }, [id]);

  const votar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/peticiones/${id}/votar`,
        { tipoVoto: voto, mensaje: comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Voto registrado correctamente.');
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
            <div className="flex flex-wrap items-center gap-3">
              <button
                className={`btn ${voto === 'aprobar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setVoto('aprobar')}
              >
                👍 Aprobar
              </button>
              <button
                className={`btn ${voto === 'rechazar' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setVoto('rechazar')}
              >
                👎 Rechazar
              </button>
            </div>
            <textarea
              rows={3}
              className="input bg-slate-900/70 mt-2"
              placeholder="Comentario (obligatorio si rechazas)"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
            <button className="btn btn-primary w-full md:w-auto" onClick={votar}>
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
        </div>
      </main>
    </>
  );
}
