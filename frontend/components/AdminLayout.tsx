import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import Header from './Header';

export type AuthUser = {
  id: string;
  displayName: string;
  email: string;
  rol: string;
};

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/peticiones', label: 'Peticiones' },
  { href: '/admin/solicitudes', label: 'Solicitudes' },
  { href: '/admin/config', label: 'Configuración' }
];

export default function AdminLayout({ title, description, children }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

    if (!token || !storedUser) {
      router.replace('/login');
      return;
    }
    try {
      const parsed = JSON.parse(storedUser) as AuthUser;
      if (parsed.rol !== 'admin') {
        router.replace('/');
        return;
      }
      setUser(parsed);
      setLoading(false);
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);

  const activeHref = useMemo(() => router.pathname, [router.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">Cargando panel de administración...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary/70 font-bold">Panel de Control</p>
            <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            {description && <p className="text-secondary text-sm mt-1 max-w-2xl">{description}</p>}
          </div>
          <div className="bg-surface/70 border border-slate-800 rounded-xl px-4 py-3 text-sm">
            <p className="uppercase text-[10px] tracking-[0.25em] text-slate-400 font-bold">Administrador</p>
            <p className="font-bold text-white">{user?.displayName}</p>
            <p className="text-secondary text-xs">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg border text-sm font-bold uppercase tracking-widest transition-colors ${
                activeHref === link.href
                  ? 'bg-primary text-black border-primary shadow-lg shadow-primary/30'
                  : 'bg-surface/60 border-slate-800 hover:border-primary hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="card bg-surface/80 border border-slate-800 shadow-xl">{children}</div>
      </main>
    </div>
  );
}
