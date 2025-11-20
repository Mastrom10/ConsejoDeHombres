import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const url = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      const { data } = await axios.post(url, form);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al conectar');
    }
  };

  return (
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

              <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`} className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-6 hover:bg-white hover:text-black transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                Google
              </a>

              <p className="text-sm text-secondary">
                {isLogin ? '¿Aún no eres miembro?' : '¿Ya tienes tus credenciales?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
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
  );
}