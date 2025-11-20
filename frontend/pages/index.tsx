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
      <div className="relative h-80 md:h-96 w-full overflow-hidden border-b-4 border-slate-800 mb-12 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-background z-10"></div>
        {/* Imagen Local */}
        <img 
          src="/img/PatricioConsejo.jpg" 
          alt="Consejo Banner" 
          className="w-full h-full object-cover object-top opacity-90 contrast-125 grayscale-[20%]"
        />
        <div className="absolute bottom-0 left-0 z-20 w-full p-6 md:p-12 pb-16">
          <div className="max-w-6xl mx-auto text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] uppercase italic">
              EL CONSEJO DE HOMBRES
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 max-w-3xl font-serif italic drop-shadow-md border-l-4 border-primary pl-6 ml-2 md:ml-0">
              "Donde la razón impera y las decisiones forjan el destino de la hermandad."
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4">
        {/* Alerta de Estado Pendiente */}
        {user && user.estadoMiembro === 'pendiente_aprobacion' && (
          <div className="mb-12 bg-amber-900/20 border border-amber-600/30 rounded-lg p-6 flex items-start gap-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <span className="text-4xl animate-pulse">📜</span>
            <div>
              <h3 className="text-amber-500 font-black uppercase tracking-widest text-lg mb-1">Estatus: ASPIRANTE EN ESPERA</h3>
              <p className="text-amber-100/70 font-serif text-lg">
                El Alto Mando está deliberando sobre tu valía. Tu ingreso al Círculo Interior está siendo procesado.
                <br/><span className="text-sm opacity-60 mt-2 block not-italic font-sans">Protocolo de seguridad #404: Paciencia requerida.</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-100">Asuntos de la Mesa</h2>
            <p className="text-sm text-primary font-bold tracking-widest uppercase mt-1">Sesión Ordinaria del Día</p>
          </div>
          <div className="flex gap-4">
             {/* Filtros decorativos */}
            <button className="text-xs font-bold uppercase tracking-widest text-white border-b-2 border-primary pb-1">Orden del Día</button>
            <button className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors pb-1">Archivos Históricos</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-80 bg-surface rounded animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {peticiones.map(p => (
              <PeticionCard key={p.id} peticion={p} />
            ))}
            {peticiones.length === 0 && (
              <div className="col-span-full py-24 text-center bg-surface/30 rounded border border-dashed border-slate-800">
                <h3 className="text-2xl font-bold text-slate-600 mb-2">Silencio en la Sala</h3>
                <p className="text-slate-500 mb-6">No hay mociones presentadas ante el tribunal.</p>
                {user?.estadoMiembro === 'miembro_aprobado' && (
                  <Link href="/crear-peticion" className="btn btn-primary uppercase tracking-widest text-xs py-3 px-8">
                    Romper el Silencio
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