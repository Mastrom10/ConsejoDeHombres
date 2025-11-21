import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type User = {
  estadoMiembro: string;
  rol?: string;
};

type EstadoVotos = {
  votosDisponibles: number;
  tiempoRestante: number;
  maxVotos: number;
  minutosRegeneracion: number;
};

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [estadoVotos, setEstadoVotos] = useState<EstadoVotos | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn || !user || user.estadoMiembro !== 'miembro_aprobado') return;

    const cargarEstadoVotos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/auth/votos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEstadoVotos(res.data);
        setTiempoRestante(res.data.tiempoRestante);
      } catch (error) {
        console.error('Error al cargar estado de votos:', error);
      }
    };

    cargarEstadoVotos();
    const interval = setInterval(cargarEstadoVotos, 10000); // Actualizar cada 10 segundos

    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (!estadoVotos || estadoVotos.tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          // Recargar estado cuando llegue a 0
          const token = localStorage.getItem('token');
          axios.get(`${API}/auth/votos`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then((res) => {
            setEstadoVotos(res.data);
            setTiempoRestante(res.data.tiempoRestante);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [estadoVotos]);

  const formatearTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    setIsLoggedIn(false);
    setUser(null);
  };

  const isApproved = user?.estadoMiembro === 'miembro_aprobado';
  const isAdmin = user?.rol === 'admin';

  return (
    <header className="bg-surface/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
           <span className="text-2xl group-hover:animate-pulse">⚔️</span>
           <span className="text-sm sm:text-base md:text-xl font-black uppercase tracking-[0.25em] bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
             El Consejo de Hombres
           </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest uppercase text-slate-400">
          {isLoggedIn && (
            <>
              <Link href="/" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">Peticiones</Link>
              <Link href="/solicitudes" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">Solicitudes</Link>
              {isAdmin && (
                <Link href="/admin" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">
                  Admin
                </Link>
              )}
            </>
          )}
          {isLoggedIn ? (
            <>
              {isApproved ? (
                <Link href="/crear-peticion" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">
                  Elevar Petición
                </Link>
              ) : (
                <span className="text-slate-700 cursor-not-allowed" title="Rango insuficiente">
                  Elevar Petición 🔒
                </span>
              )}
              <Link href="/perfil" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">Expediente</Link>
              {isApproved && estadoVotos && (
                <div className="flex items-center gap-2 px-3 py-1 rounded border border-slate-600 bg-slate-800/50">
                  <span className="text-xs font-bold text-slate-300">
                    🗳️ {estadoVotos.votosDisponibles}/{estadoVotos.maxVotos}
                  </span>
                  {estadoVotos.votosDisponibles < estadoVotos.maxVotos && tiempoRestante > 0 && (
                    <span className="text-xs text-slate-400 font-mono">
                      {formatearTiempo(tiempoRestante)}
                    </span>
                  )}
                </div>
              )}
              <button onClick={logout} className="text-red-500 hover:text-red-400 transition-colors border border-red-900/30 px-3 py-1 rounded hover:bg-red-900/10">
                Desertar
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary py-2 px-4 text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              Presentarse
            </Link>
          )}
        </nav>

        {/* Acciones compactas para móvil */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 px-2 py-1 rounded"
                >
                  Admin
                </Link>
              )}
              {isApproved && (
                <Link
                  href="/crear-peticion"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 px-2 py-1 rounded"
                >
                  Elevar
                </Link>
              )}
              <button
                onClick={logout}
                className="text-[10px] font-bold uppercase tracking-widest text-red-400 border border-red-500/40 px-2 py-1 rounded"
              >
                Desertar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary text-[11px] px-3 py-1 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
            >
              Presentarse
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
