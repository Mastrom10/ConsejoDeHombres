import { useEffect, useState } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type User = {
  displayName: string;
  email: string;
  avatarUrl?: string;
  estadoMiembro: string;
  rol: string;
  // Supongamos que el backend enviara esto en el futuro, por ahora simulamos
  votosRecibidos?: number; 
};

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  
  // Simulación de votos para el ejemplo (el backend debería enviarlo en 'solicitudes')
  // En un caso real, haríamos un fetch a /solicitudes/me
  const votosNecesarios = 10;
  const votosActuales = 3; // Hardcodeado para efecto visual "absurdo"

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const getRoleLabel = (role: string, status: string) => {
    if (status === 'pendiente_aprobacion') return 'ASPIRANTE A NOVICIO';
    if (role === 'admin') return 'GRAN MAESTRE';
    if (role === 'moderador') return 'INQUISIDOR';
    return 'CABALLERO DE LA MESA';
  };

  const getRoleColor = (role: string, status: string) => {
    if (status === 'pendiente_aprobacion') return 'text-amber-500 border-amber-500/50 bg-amber-500/10';
    if (role === 'admin') return 'text-purple-400 border-purple-500/50 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    return 'text-sky-400 border-sky-500/50 bg-sky-500/10';
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  };

  const handleDeleteAccount = async () => {
    if (!confirm('¿Seguro que quieres borrar tu cuenta? Esta acción es irreversible.')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }
      await axios.delete(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    } catch (_e) {
      alert('No se pudo borrar la cuenta. Intenta más tarde.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-5xl p-4 py-12">
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-1">Expediente Personal</h1>
                <p className="text-primary font-serif italic text-sm">"Confidencial - Solo para ojos autorizados"</p>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-xs text-slate-600 uppercase tracking-widest">Código de Agente</div>
                <div className="font-mono text-slate-400">CH-{Math.floor(Math.random() * 10000)}</div>
            </div>
        </div>
        
        {!user ? (
          <div className="text-center py-12 border border-red-900/30 bg-red-900/10 rounded p-8">
            <h2 className="text-red-500 font-bold text-xl uppercase mb-2">⚠️ Acceso Denegado</h2>
            <p className="text-red-300/70 mb-4">Identificación requerida para acceder a los archivos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Columna Izquierda: Tarjeta de Identidad Táctica */}
            <div className="lg:col-span-4">
              <div className="bg-surface border border-slate-700 rounded-lg p-6 shadow-2xl relative overflow-hidden">
                {/* Decoración de fondo "Top Secret" */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-slate-800 rotate-45 z-0"></div>
                
                <div className="relative z-10 text-center">
                    <div className="w-40 h-40 mx-auto rounded-md bg-slate-900 border-2 border-slate-600 shadow-inner overflow-hidden mb-6 relative">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover contrast-125 grayscale-[50%]" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                            <span className="text-5xl font-black opacity-20">{getInitials(user.displayName)}</span>
                            <span className="text-[10px] mt-2 uppercase tracking-widest opacity-40">No Image</span>
                        </div>
                    )}
                    {/* Sello de agua */}
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{user.displayName}</h2>
                    <p className="text-xs text-slate-500 font-mono mb-6 tracking-wider">{user.email}</p>
                    
                    <div className={`inline-block w-full py-3 border-y-2 text-sm font-black tracking-[0.2em] uppercase ${getRoleColor(user.rol, user.estadoMiembro)}`}>
                        {getRoleLabel(user.rol, user.estadoMiembro)}
                    </div>
                </div>
              </div>

              {/* Panel de Estado del Aspirante */}
              {user.estadoMiembro === 'pendiente_aprobacion' && (
                  <div className="mt-6 bg-slate-900 border border-dashed border-amber-700/50 p-4 rounded">
                      <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-3">Progreso de Aprobación</h3>
                      <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700 mb-2">
                          <div 
                            className="bg-amber-600 h-full relative stripe-pattern" 
                            style={{ width: `${(votosActuales / votosNecesarios) * 100}%` }}
                          ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 font-mono">
                          <span>{votosActuales} Votos a favor</span>
                          <span>Objetivo: {votosNecesarios}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-3 italic text-center">
                          "La paciencia es la primera virtud del caballero."
                      </p>
                  </div>
              )}
            </div>

            {/* Columna Derecha: Detalles Clasificados */}
            <div className="lg:col-span-8 space-y-6">
              <div className="card border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-6 border-b border-slate-700 pb-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-100">Datos de Filiación</h3>
                    <span className="bg-slate-800 text-xs px-2 py-1 rounded text-slate-400 font-mono">NIVEL 1</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-4">
                  <div>
                    <span className="block text-primary/60 text-[10px] uppercase tracking-[0.2em] mb-1">Rango Operativo</span>
                    <span className="text-white font-bold text-lg font-serif">{user.rol.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-primary/60 text-[10px] uppercase tracking-[0.2em] mb-1">Fecha de Juramento</span>
                    <span className="text-white font-bold text-lg font-serif">CLASSIFIED</span>
                  </div>
                  <div className="col-span-full">
                     <div className="p-4 bg-slate-950 border border-slate-800 rounded flex gap-4 items-center">
                        <span className="text-3xl">🔏</span>
                        <div>
                            <h4 className="text-white font-bold text-sm uppercase">Solicitud de Modificación</h4>
                            <p className="text-slate-500 text-xs mt-1">
                                Para alterar cualquier registro biométrico (avatar) o credencial, debe presentar el formulario 27B ante el Alto Mando o esperar la auditoría trimestral.
                            </p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Estadísticas de Combate */}
              <div className="card opacity-70 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-slate-100">Hoja de Servicios</h3>
                    <span className="text-xs text-amber-500 font-mono border border-amber-500/30 px-2 py-0.5 rounded">EN DESARROLLO</span>
                 </div>
                 <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-2xl font-black text-white">0</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Mociones</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-2xl font-black text-white">0</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Votos Emitidos</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded">
                        <div className="text-2xl font-black text-white">0</div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Honor</div>
                    </div>
                 </div>
              </div>

              {/* Borrar cuenta */}
              <div className="card border border-red-900/50 bg-red-950/40">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-black uppercase tracking-widest text-red-400">Autodestrucción del Expediente</h3>
                  <span className="text-xs text-red-400 font-mono border border-red-500/50 px-2 py-0.5 rounded">ACCION FINAL</span>
                </div>
                <p className="text-sm text-red-200/80 mb-4">
                  Esta operación eliminará tu cuenta del Consejo, junto con tus votos, solicitudes y peticiones. No hay marcha atrás.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-secondary border-red-600/60 text-red-300 hover:bg-red-800/40 hover:text-red-100"
                >
                  🧨 Borrar cuenta y abandonar el Consejo
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}