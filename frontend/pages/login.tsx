import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import SEO from '../components/SEO';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [genderConfirmed, setGenderConfirmed] = useState(false);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const { data } = await axios.post(url, form);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (isLogin) {
        router.push('/');
      } else {
        // Si es registro, verificar si necesita completar solicitud
        const user = data.user;
        if (user.estadoMiembro === 'pendiente_aprobacion') {
          // Verificar si ya tiene una solicitud
          try {
            const solicitudesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/solicitudes`, {
              headers: { Authorization: `Bearer ${data.token}` }
            });
            const tieneSolicitud = solicitudesRes.data.some((s: any) => 
              s.usuarioId === user.id || s.id?.startsWith(`virtual-${user.id}`)
            );
            if (!tieneSolicitud) {
              router.push('/registro-solicitud');
              return;
            }
          } catch {
            // Si hay error, igual redirigir a completar solicitud
            router.push('/registro-solicitud');
            return;
          }
        }
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar');
    }
  };

  return (
    <>
      <SEO
        title="Iniciar Sesión"
        description="Accede al Consejo de Hombres. Inicia sesión con tu cuenta o regístrate para formar parte de nuestra comunidad de deliberación y toma de decisiones."
        keywords="login, iniciar sesión, registro, consejo de hombres, acceso, membresía"
        url="/login"
        noindex={true}
      />
      <div className="min-h-screen flex flex-col bg-background relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2074&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/50"></div>
      </div>

      <div className="relative z-10">
        <Header />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="card backdrop-blur-sm bg-surface/90 border-slate-600/50 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
                {isLogin ? 'Bienvenido al Consejo' : 'Únete a la Hermandad'}
              </h1>
              <p className="text-secondary text-sm">
                {isLogin ? 'Tu voz y tu voto son requeridos en la mesa.' : 'Comienza tu camino para ser miembro oficial.'}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">Alias / Nombre</label>
                  <input
                    type="text"
                    className="input bg-slate-900/50"
                    placeholder="Ej. CaballeroOscuro"
                    value={form.displayName}
                    onChange={e => setForm({...form, displayName: e.target.value})}
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">Correo Electrónico</label>
                <input
                  type="email"
                  className="input bg-slate-900/50"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1 tracking-wider">Contraseña</label>
                <input
                  type="password"
                  className="input bg-slate-900/50"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 text-lg shadow-lg shadow-primary/20 mt-4">
                {isLogin ? 'Ingresar al Templo' : 'Solicitar Ingreso'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-surface px-2 text-slate-500">Alternativa</span></div>
              </div>

              <button
                onClick={() => {
                  if (isLogin) {
                    // Si es login, ir directo a Google
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
                  } else {
                    // Si es registro, mostrar modal primero
                    setShowGenderModal(true);
                    setPendingGoogleAuth(true);
                  }
                }}
                className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-6 hover:bg-white hover:text-black transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                {isLogin ? 'Google' : 'Continuar con Google'}
              </button>
              
              {!isLogin && (
                <p className="text-xs text-slate-500 text-center mb-4">
                  Al registrarte, deberás completar tu solicitud de adhesión
                </p>
              )}

              <p className="text-sm text-secondary">
                {isLogin ? '¿Aún no eres miembro?' : '¿Ya tienes tus credenciales?'}
                <button
                  onClick={() => {
                    if (!isLogin) {
                      setIsLogin(true);
                    } else {
                      // Mostrar modal antes de cambiar a registro
                      setShowGenderModal(true);
                    }
                  }}
                  className="ml-2 text-primary hover:text-accent font-bold hover:underline transition-colors"
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Modal de Declaración de Género */}
      {showGenderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-slate-700 rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white mb-3">Declaración Requerida</h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Este es un sitio exclusivo para hombres. Solo los hombres pueden registrarse y formar parte del Consejo de Hombres.
              </p>
              <p className="text-red-400 text-sm font-bold mt-3">
                Si no eres hombre, debes salir de esta página.
              </p>
            </div>

            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-primary/50 transition-colors">
                <input
                  type="checkbox"
                  checked={genderConfirmed}
                  onChange={(e) => setGenderConfirmed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
                  required
                />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">
                    Declaro que soy hombre y tengo derecho a registrarme en este sitio.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGenderModal(false);
                  setGenderConfirmed(false);
                  setPendingGoogleAuth(false);
                }}
                className="btn btn-secondary flex-1"
              >
                Salir
              </button>
              <button
                onClick={() => {
                  if (!genderConfirmed) {
                    alert('Debes confirmar que eres hombre para continuar.');
                    return;
                  }
                  
                  setShowGenderModal(false);
                  
                  if (pendingGoogleAuth) {
                    // Redirigir a Google auth
                    setPendingGoogleAuth(false);
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
                  } else {
                    // Cambiar a modo registro
                    setIsLogin(false);
                  }
                  
                  setGenderConfirmed(false);
                }}
                className="btn btn-primary flex-1"
                disabled={!genderConfirmed}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}