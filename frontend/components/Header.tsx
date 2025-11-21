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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    if (!mobileMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

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
          <Link href="/codigo-hombres" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">
            Código
          </Link>
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
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <span>🗳️</span>
                    <span>{estadoVotos.votosDisponibles}/{estadoVotos.maxVotos}</span>
                  </span>
                  {estadoVotos.votosDisponibles < estadoVotos.maxVotos && tiempoRestante > 0 && (
                    <span className="text-xs text-slate-400 font-mono">
                      {formatearTiempo(tiempoRestante)}
                    </span>
                  )}
                </div>
              )}
              <Link href="/perfil" className="hover:text-white transition-colors hover:underline decoration-primary underline-offset-4">Expediente</Link>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary py-2 px-4 text-xs shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              Presentarse
            </Link>
          )}
        </nav>

        {/* Acciones compactas para móvil */}
        <div className="flex md:hidden items-center gap-2 relative mobile-menu-container">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-2xl hover:opacity-80 transition-opacity"
                aria-label="Menú"
              >
                ☰
              </button>
              
              {mobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-surface border border-slate-700 rounded-lg shadow-xl z-50 min-w-[200px] py-2">
                  <Link
                    href="/codigo-hombres"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Código
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Peticiones
                  </Link>
                  <Link
                    href="/solicitudes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    Solicitudes
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-slate-800 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  {isApproved && (
                    <Link
                      href="/crear-peticion"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary hover:bg-slate-800 transition-colors"
                    >
                      Elevar Petición
                    </Link>
                  )}
                  {isApproved && estadoVotos && (
                    <div className="px-4 py-2 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-300">🗳️</span>
                        <span className="text-slate-300 font-bold">{estadoVotos.votosDisponibles}/{estadoVotos.maxVotos}</span>
                        {estadoVotos.votosDisponibles < estadoVotos.maxVotos && tiempoRestante > 0 && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            {formatearTiempo(tiempoRestante)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <Link
                    href="/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-t border-slate-700"
                  >
                    Expediente
                  </Link>
                </div>
              )}
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
