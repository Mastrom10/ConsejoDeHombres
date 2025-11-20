import { useEffect, useState } from 'react';
import Header from '../components/Header';

type User = {
  displayName: string;
  email: string;
  avatarUrl?: string;
  estadoMiembro: string;
  rol: string;
};

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Cargamos del localStorage para inmediatez
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'miembro_aprobado': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'pendiente_aprobacion': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'rechazado': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-slate-400';
    }
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto max-w-4xl p-4 py-12">
        <h1 className="text-3xl mb-8 border-b border-slate-700 pb-4">Mi Perfil</h1>
        
        {!user ? (
          <div className="text-center py-12">
            <p className="text-secondary mb-4">No has iniciado sesión.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Columna Izquierda: Tarjeta de Identidad */}
            <div className="md:col-span-1">
              <div className="card text-center">
                <div className="w-32 h-32 mx-auto rounded-full bg-slate-800 border-4 border-surface shadow-xl overflow-hidden mb-4 relative group">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600">
                      {getInitials(user.displayName)}
                    </div>
                  )}
                </div>
                
                <h2 className="text-xl font-bold text-white mb-1">{user.displayName}</h2>
                <p className="text-sm text-secondary mb-4">{user.email}</p>
                
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(user.estadoMiembro)}`}>
                  {user.estadoMiembro.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>

            {/* Columna Derecha: Detalles */}
            <div className="md:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-bold mb-4 text-primary">Información de Miembro</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-secondary text-xs uppercase tracking-wider">Rol</span>
                    <span className="text-white font-medium">{user.rol.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-secondary text-xs uppercase tracking-wider">Fecha de Ingreso</span>
                    <span className="text-white font-medium">No disponible</span>
                  </div>
                  <div className="col-span-2">
                     <div className="p-3 rounded bg-slate-800/50 border border-slate-700">
                        <p className="text-slate-400 text-xs">
                           ℹ️ Si deseas cambiar tu avatar o información, por favor contacta a un administrador o espera a la próxima actualización del sistema.
                        </p>
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Aquí podrías agregar estadísticas del usuario en el futuro */}
              <div className="card opacity-50">
                 <h3 className="text-lg font-bold mb-2">Estadísticas (Próximamente)</h3>
                 <p className="text-sm text-secondary">Votos realizados, peticiones creadas y karma.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}