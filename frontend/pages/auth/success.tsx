import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../../components/Header';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AuthSuccessPage() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando con el Consejo...');

  useEffect(() => {
    if (!token) return;
    if (typeof token !== 'string') {
      setStatus('error');
      setMessage('Token inválido.');
      return;
    }

    const run = async () => {
      try {
        // Guardar token
        localStorage.setItem('token', token);

        // Obtener perfil completo
        const { data } = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.setItem('user', JSON.stringify(data));

        // Redirigir al inicio
        router.replace('/');
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setMessage(err.response?.data?.message || 'No se pudo completar el inicio de sesión.');
      }
    };

    run();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-black mb-2">Autenticando con Google…</h1>
          <p className="text-secondary text-sm mb-4">
            {status === 'loading'
              ? 'Un momento, estamos recibiendo las credenciales del Templo de Google.'
              : message}
          </p>
          {status === 'error' && (
            <button
              className="btn btn-primary mt-2"
              onClick={() => router.replace('/login')}
            >
              Volver al acceso
            </button>
          )}
        </div>
      </main>
    </div>
  );
}


