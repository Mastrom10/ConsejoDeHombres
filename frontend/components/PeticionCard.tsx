import Link from 'next/link';

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
  const porcentaje = Math.round((peticion.totalAprobaciones / Math.max(1, peticion.totalAprobaciones + peticion.totalRechazos)) * 100);
  return (
    <div className="card">
      <div className="flex-between">
        <div>
          <h3>{peticion.titulo}</h3>
          <small>Por {peticion.autor.displayName}</small>
        </div>
        <span className="badge" style={{ background: peticion.estadoPeticion === 'aprobada' ? '#22c55e' : peticion.estadoPeticion === 'no_aprobada' ? '#ef4444' : '#f59e0b' }}>
          {peticion.estadoPeticion}
        </span>
      </div>
      <p>{peticion.descripcion.slice(0, 120)}...</p>
      <div className="flex" style={{ gap: 10 }}>
        <span>❤️ {peticion.likes}</span>
        <span>👍 {peticion.totalAprobaciones}</span>
        <span>👎 {peticion.totalRechazos}</span>
        <span>{porcentaje}% aprobación</span>
      </div>
      <Link href={`/peticiones/${peticion.id}`}>Ver detalle →</Link>
    </div>
  );
}
