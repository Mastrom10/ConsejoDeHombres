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
  usuario: { displayName: string; avatarUrl?: string };
};

export default function Solicitudes() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    axios
      .get(`${API}/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setSolicitudes(res.data))
      .catch(() => setSolicitudes([]));
  }, [router]);

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
                      src={s.fotoSolicitudUrl}
                      alt="Solicitud"
                      className="w-32 h-32 object-cover rounded-md border border-slate-700"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Aspirante: {s.usuario.displayName}
                        </h3>
                        <p className="text-xs text-secondary">
                          Estado actual: {s.estadoSolicitud.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200 whitespace-pre-line">
                      {s.textoSolicitud}
                    </p>
                    <div className="flex gap-4 text-xs text-secondary mt-2">
                      <span>👍 {s.totalAprobaciones} a favor</span>
                      <span>👎 {s.totalRechazos} en contra</span>
                    </div>
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
