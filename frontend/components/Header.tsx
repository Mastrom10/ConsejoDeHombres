import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type User = {
  estadoMiembro: string;
};

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    setIsLoggedIn(!!token);
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
    setIsLoggedIn(false);
    setUser(null);
  };

  const isApproved = user?.estadoMiembro === 'miembro_aprobado';

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          ⚔️ Consejo
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">Peticiones</Link>
          <Link href="/solicitudes" className="hover:text-white transition-colors">Solicitudes</Link>
          {isLoggedIn ? (
            <>
              {isApproved ? (
                <Link href="/crear-peticion" className="hover:text-white transition-colors">
                  Crear Petición
                </Link>
              ) : (
                <span className="text-slate-600 cursor-not-allowed" title="Debes ser miembro aprobado para crear peticiones">
                  Crear Petición 🔒
                </span>
              )}
              <Link href="/perfil" className="hover:text-white transition-colors">Mi Perfil</Link>
              <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors">
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary py-1.5 text-xs">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}