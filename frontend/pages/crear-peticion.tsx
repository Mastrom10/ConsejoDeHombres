import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../components/Header';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CrearPeticion() {
  const router = useRouter();
  const [form, setForm] = useState({ titulo: '', descripcion: '', imagenes: '', videoUrl: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (user.estadoMiembro !== 'miembro_aprobado') {
      setIsAllowed(false);
    } else {
      setIsAllowed(true);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/peticiones`,
        {
          titulo: form.titulo,
          descripcion: form.descripcion,
          imagenes: form.imagenes.split(',').filter(Boolean),
          videoUrl: form.videoUrl || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus('success');
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      setStatus('error');
      setMensaje(error.response?.data?.message || 'Error al crear petición');
    }
  };

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="card max-w-md text-center p-8">
            <span className="text-4xl mb-4 block">🔒</span>
            <h1 className="text-2xl mb-2">Acceso Restringido</h1>
            <p className="text-secondary mb-6">
              Solo los miembros aprobados por el Consejo pueden elevar nuevas peticiones a la mesa.
            </p>
            <Link href="/" className="btn btn-primary">Volver al inicio</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-2xl p-4 py-12">
        <h1 className="text-3xl mb-2">Crear Petición</h1>
        <p className="text-secondary mb-8">Presenta tu caso ante el Consejo. Sé claro y respetuoso.</p>

        <form className="card space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Título de la Petición</label>
            <input 
              className="input" 
              placeholder="Ej: Prohibir ponerle piña a la pizza"
              value={form.titulo} 
              onChange={(e) => setForm({ ...form, titulo: e.target.value })} 
              required 
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">Descripción Detallada</label>
            <textarea 
              className="input min-h-[150px]" 
              placeholder="Explica tus motivos y argumentos..."
              value={form.descripcion} 
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })} 
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Imágenes (Opcional)</label>
              <input 
                className="input text-sm" 
                placeholder="URLs separadas por comas"
                value={form.imagenes} 
                onChange={(e) => setForm({ ...form, imagenes: e.target.value })} 
              />
              <p className="text-xs text-slate-500 mt-1">Ej: https://imgur.com/..., https://...</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">Video URL (Opcional)</label>
              <input 
                className="input text-sm" 
                placeholder="YouTube, Vimeo..."
                value={form.videoUrl} 
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} 
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="p-3 rounded bg-red-500/20 text-red-300 text-sm border border-red-500/50">
              {mensaje}
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 rounded bg-green-500/20 text-green-300 text-sm border border-green-500/50">
              ¡Petición creada con éxito! Redirigiendo...
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/" className="btn btn-secondary">Cancelar</Link>
            <button 
              className="btn btn-primary min-w-[120px]" 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
            >
              {status === 'loading' ? 'Enviando...' : 'Publicar Petición'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}