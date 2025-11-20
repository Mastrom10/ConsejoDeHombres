import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

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
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  useEffect(() => {
    axios.get(`${API}/solicitudes`).then((res) => setSolicitudes(res.data));
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h1>Solicitudes pendientes</h1>
        <div className="grid">
          {solicitudes.map((s) => (
            <div className="card" key={s.id}>
              <div className="flex-between">
                <div>
                  <h3>{s.usuario.displayName}</h3>
                  <small>{s.estadoSolicitud}</small>
                </div>
                <img src={s.fotoSolicitudUrl} alt="Solicitud" style={{ width: 80, borderRadius: 10 }} />
              </div>
              <p>{s.textoSolicitud}</p>
              <div className="flex" style={{ gap: 8 }}>
                <span>👍 {s.totalAprobaciones}</span>
                <span>👎 {s.totalRechazos}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
