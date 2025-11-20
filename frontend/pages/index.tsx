import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Header from '../components/Header';
import PeticionCard, { PeticionDto } from '../components/PeticionCard';

type User = {
  estadoMiembro: string;
  displayName: string;
};

export default function Home() {
  const [peticiones, setPeticiones] = useState<PeticionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Cargar usuario
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));

    // Cargar peticiones
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/peticiones`)
      .then(res => setPeticiones(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden border-b border-slate-700 mb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background z-10"></div>
        <div className="absolute inset-0 bg-slate-900/40 z-0"></div>
        {/* Imagen Local */}
        <img 
          src="/img/PatricioConsejo.jpg" 
          alt="Consejo Banner" 
          className="w-full h-full object-cover object-center opacity-80"
        />
        <div className="absolute bottom-0 left-0 z-20 w-full p-6 md:p-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 drop-shadow-lg">
              La Voz del Consejo
            </h1>
            <p className="text-lg text-slate-200 max-w-2xl drop-shadow-md font-medium">
              Propón, debate y vota. Aquí se toman las decisiones que importan. 
              Únete a la mesa y haz valer tu opinión.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4">
        {/* Alerta de Estado Pendiente */}
        {user && user.estadoMiembro === 'pendiente_aprobacion' && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="text-amber-400 font-bold text-lg">Tu solicitud está en revisión</h3>
              <p className="text-amber-200/80 text-sm">
                El Consejo está evaluando tu ingreso. Mientras tanto, puedes ver las peticiones pero no podrás votar ni crear nuevas propuestas hasta ser aprobado.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Últimas Peticiones</h2>
            <p className="text-sm text-secondary">Lo que se está debatiendo hoy en la mesa.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-sm font-medium text-slate-300 hover:text-white border-b-2 border-primary transition-colors">Recientes</button>
            <button className="px-3 py-1 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent transition-colors">Populares</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-surface rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {peticiones.map(p => (
              <PeticionCard key={p.id} peticion={p} />
            ))}
            {peticiones.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-surface/30 rounded-xl border border-dashed border-slate-700">
                <p>No hay peticiones activas en este momento.</p>
                {user?.estadoMiembro === 'miembro_aprobado' && (
                  <Link href="/crear-peticion" className="text-primary hover:underline mt-2 inline-block">
                    Sé el primero en hablar
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}