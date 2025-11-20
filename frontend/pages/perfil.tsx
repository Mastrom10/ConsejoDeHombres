import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type User = {
  displayName: string;
  avatarUrl?: string;
  estadoMiembro: string;
  rol: string;
  peticiones?: any[];
};

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    axios
      .get(`${API}/peticiones?autor=me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser({ ...(res.data?.autor || {}), peticiones: res.data?.peticiones || [] }))
      .catch(() => setMensaje('Carga básica de perfil. Ajustar endpoint en producción.'));
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h1>Perfil</h1>
        {!user && <p>Inicia sesión para ver tu perfil.</p>}
        {user && (
          <div className="card">
            <div className="flex" style={{ gap: 12, alignItems: 'center' }}>
              <img src={user.avatarUrl || 'https://placekitten.com/80/80'} style={{ width: 70, borderRadius: 50 }} />
              <div>
                <h2>{user.displayName}</h2>
                <p>{user.estadoMiembro} · {user.rol}</p>
              </div>
            </div>
            <p>{mensaje}</p>
          </div>
        )}
      </div>
    </>
  );
}
