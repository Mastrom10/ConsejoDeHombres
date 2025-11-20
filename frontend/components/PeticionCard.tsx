import Link from 'next/link';
import { useState } from 'react';

export type PeticionDto = {
  id: string;
  titulo: string;
  descripcion: string;
  likes: number;
  totalAprobaciones: number;
  totalRechazos: number;
  estadoPeticion: string;
  autor: { displayName: string; avatarUrl?: string };
  createdAt?: string;
};

export default function PeticionCard({ peticion }: { peticion: PeticionDto }) {
  const [reported] = useState(false);
  const totalVotos = peticion.totalAprobaciones + peticion.totalRechazos;
  const porcentaje = totalVotos > 0 
    ? Math.round((peticion.totalAprobaciones / totalVotos) * 100) 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprobada': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'no_aprobada': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'cerrada': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  if (reported) return null; // Ocultar localmente si se reporta con éxito

  return (
    <div className="card group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
            {peticion.autor.avatarUrl ? (
              <img src={peticion.autor.avatarUrl} alt={peticion.autor.displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-slate-400">{peticion.autor.displayName.charAt(0)}</span>
            )}
          </div>
          <div>
            <Link href={`/peticiones/${peticion.id}`}>
              <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">
                {peticion.titulo}
              </h3>
            </Link>
            <p className="text-xs text-secondary">
              Por {peticion.autor.displayName} • {new Date(peticion.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(peticion.estadoPeticion)}`}>
            {getStatusLabel(peticion.estadoPeticion)}
          </span>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-6 line-clamp-4 md:line-clamp-5">
        {peticion.descripcion}
      </p>

      <div className="flex items-center justify-between border-t border-slate-700 pt-4 mt-auto">
        <div className="flex gap-4 text-sm text-secondary font-medium">
          <div className="flex items-center gap-1 text-pink-400">
            <span>❤️</span> {peticion.likes}
          </div>
          <div className="flex items-center gap-1 text-sky-400">
            <span>🗳️</span> {totalVotos}
          </div>
          <div className="flex items-center gap-1">
            <span className={porcentaje >= 70 ? 'text-green-400' : 'text-yellow-400'}>
              {porcentaje}%
            </span> a favor
          </div>
        </div>

        <Link 
          href={`/peticiones/${peticion.id}`}
          className="text-sm font-bold text-primary hover:text-sky-300 hover:underline decoration-2 underline-offset-4"
        >
          Ver detalle →
        </Link>
      </div>
    </div>
  );
}