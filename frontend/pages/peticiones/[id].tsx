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

  useEffect(() => {
    if (!id) return;
    axios.get(`${API}/peticiones`, { params: { id } }).then((res) => {
      const match = Array.isArray(res.data) ? res.data.find((p: any) => p.id === id) : res.data;
      setPeticion(match);
    });
  }, [id]);

  const votar = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/peticiones/${id}/votar`,
        { tipoVoto: voto, mensaje: comentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMensaje('Voto registrado');
    } catch (e: any) {
      setMensaje(e.response?.data?.message || 'Error al votar');
    }
  };

  if (!peticion) return (
    <>
      <Header />
      <div className="container">Cargando...</div>
    </>
  );

  const porcentaje = Math.round((peticion.totalAprobaciones / Math.max(1, peticion.totalAprobaciones + peticion.totalRechazos)) * 100);

  return (
    <>
      <Header />
      <div className="container">
        <div className="card">
          <h1>{peticion.titulo}</h1>
          <p>{peticion.descripcion}</p>
          <div className="flex" style={{ gap: 12 }}>
            {peticion.imagenes?.map((img: string) => (
              <img key={img} src={img} style={{ width: 120, borderRadius: 10 }} />
            ))}
          </div>
          {peticion.videoUrl && <video src={peticion.videoUrl} controls style={{ width: '100%', marginTop: 12 }} />}
          <p>Estado: {peticion.estadoPeticion} · {porcentaje}% aprobación</p>
          <div className="flex" style={{ gap: 10 }}>
            <button className="btn btn-primary" onClick={() => setVoto('aprobar')}>👍 Aprobar</button>
            <button className="btn btn-danger" onClick={() => setVoto('rechazar')}>👎 Rechazar</button>
          </div>
          <textarea rows={3} placeholder="Comentario (obligatorio si rechazas)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
          <button className="btn btn-secondary" onClick={votar}>Enviar voto</button>
          {mensaje && <p>{mensaje}</p>}
        </div>
      </div>
    </>
  );
}
