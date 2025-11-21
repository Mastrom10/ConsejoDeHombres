import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type PeticionDto = {
  id: string;
  titulo: string;
  descripcion: string;
  likes: number;
  totalAprobaciones: number;
  totalRechazos: number;
  estadoPeticion: string;
  autor: { displayName: string; avatarUrl?: string };
  autorId?: string;
  createdAt?: string;
  miVoto?: 'aprobar' | 'rechazar' | 'debatir' | null;
  imagenes?: string[];
};

export default function PeticionCard({ peticion }: { peticion: PeticionDto }) {
  const router = useRouter();
  const [reported] = useState(false);
  const [votando, setVotando] = useState(false);
  const [marcandoRelevante, setMarcandoRelevante] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(peticion.likes);
  const [mostrarModalRechazo, setMostrarModalRechazo] = useState(false);
  const [comentarioRechazo, setComentarioRechazo] = useState('');
  
  const totalVotos = peticion.totalAprobaciones + peticion.totalRechazos;
  const porcentaje = totalVotos > 0 
    ? Math.round((peticion.totalAprobaciones / totalVotos) * 100) 
    : 0;

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isApproved = user?.estadoMiembro === 'miembro_aprobado';
  const canVote = token && isApproved && user && peticion.autorId !== user.id;
  const canLike = token && isApproved;

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

  const handleVotar = async (tipoVoto: 'aprobar' | 'rechazar', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canVote || votando) return;
    
    // Si es rechazar, mostrar modal para comentario obligatorio
    if (tipoVoto === 'rechazar') {
      setMostrarModalRechazo(true);
      return;
    }
    
    // Si es aprobar, votar directamente
    await enviarVoto('aprobar', undefined);
  };

  const enviarVoto = async (tipoVoto: 'aprobar' | 'rechazar', mensaje?: string) => {
    if (!canVote || votando) return;
    
    setVotando(true);
    try {
      await axios.post(
        `${API}/peticiones/${peticion.id}/votar`,
        { tipoVoto, mensaje },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Recargar la página para actualizar los contadores
      window.location.reload();
    } catch (error: any) {
      console.error('Error al votar:', error.response?.data?.message || 'Error desconocido');
      alert(error.response?.data?.message || 'Error al votar');
    } finally {
      setVotando(false);
    }
  };

  const handleConfirmarRechazo = () => {
    if (!comentarioRechazo || comentarioRechazo.trim().length < 4) {
      alert('El comentario es obligatorio y debe tener al menos 4 caracteres.');
      return;
    }
    setMostrarModalRechazo(false);
    enviarVoto('rechazar', comentarioRechazo);
    setComentarioRechazo('');
  };

  const handleMarcarRelevante = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canLike || marcandoRelevante) return;
    
    setMarcandoRelevante(true);
    try {
      await axios.post(
        `${API}/peticiones/${peticion.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(true);
      setLikesCount(likesCount + 1);
    } catch (error: any) {
      console.error('Error al marcar como relevante:', error.response?.data?.message || 'Error desconocido');
    } finally {
      setMarcandoRelevante(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Solo navegar si no se hizo click en un botón
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    router.push(`/peticiones/${peticion.id}`);
  };

  if (reported) return null; // Ocultar localmente si se reporta con éxito

  const primeraImagen = peticion.imagenes && peticion.imagenes.length > 0 ? peticion.imagenes[0] : null;

  return (
    <>
      {/* Modal para comentario de rechazo */}
      {mostrarModalRechazo && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMostrarModalRechazo(false);
              setComentarioRechazo('');
            }
          }}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">Comentario obligatorio</h3>
            <p className="text-sm text-slate-400 mb-4">
              Para rechazar una petición, debes proporcionar un comentario explicando el motivo (mínimo 4 caracteres).
            </p>
            <textarea
              value={comentarioRechazo}
              onChange={(e) => setComentarioRechazo(e.target.value)}
              placeholder="Escribe tu comentario aquí..."
              className="w-full input bg-slate-800 border-slate-600 mb-4 min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMostrarModalRechazo(false);
                  setComentarioRechazo('');
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarRechazo}
                disabled={!comentarioRechazo || comentarioRechazo.trim().length < 4}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="card group hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative cursor-pointer overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Imagen destacada si existe */}
        {primeraImagen && (
          <div className="w-full h-48 overflow-hidden bg-slate-800 -mx-4 -mt-4 mb-4">
            <img 
              src={primeraImagen} 
              alt={peticion.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600 flex-shrink-0">
            {peticion.autor.avatarUrl ? (
              <img src={peticion.autor.avatarUrl} alt={peticion.autor.displayName} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-lg font-bold text-slate-400">{peticion.autor.displayName.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-primary transition-colors">
              {peticion.titulo}
            </h3>
            <p className="text-xs text-secondary">
              Por {peticion.autor.displayName} • {new Date(peticion.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(peticion.estadoPeticion)}`}>
            {getStatusLabel(peticion.estadoPeticion)}
          </span>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-6 line-clamp-4 md:line-clamp-5">
        {peticion.descripcion}
      </p>

      {/* Botones de acción */}
      {canVote && (
        <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleVotar('aprobar', e)}
            disabled={votando}
            className={`flex-1 btn text-sm py-2 disabled:opacity-50 ${
              peticion.miVoto === 'aprobar' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            👍 {peticion.miVoto === 'aprobar' ? 'Aprobado' : 'Aprobar'}
          </button>
          <button
            onClick={(e) => handleVotar('rechazar', e)}
            disabled={votando}
            className={`flex-1 btn text-sm py-2 disabled:opacity-50 ${
              peticion.miVoto === 'rechazar' ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            👎 {peticion.miVoto === 'rechazar' ? 'Rechazado' : 'Rechazar'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-700 pt-4 mt-auto">
        <div className="flex gap-4 text-sm text-secondary font-medium">
          <button
            onClick={handleMarcarRelevante}
            disabled={!canLike || marcandoRelevante}
            className={`flex items-center gap-1 transition-colors ${
              liked ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Marcar como relevante"
          >
            <span>⭐</span> {likesCount}
          </button>
          <div className="flex items-center gap-1 text-sky-400">
            <span>🗳️</span> {totalVotos}
          </div>
          <div className="flex items-center gap-1">
            <span className={porcentaje >= 70 ? 'text-green-400' : 'text-yellow-400'}>
              {porcentaje}%
            </span> a favor
          </div>
        </div>
      </div>
    </div>
    </>
  );
}