import { Configuracion, TipoVoto } from '@prisma/client';

export function evaluateThreshold({
  totalAprobaciones,
  totalRechazos,
  config
}: {
  totalAprobaciones: number;
  totalRechazos: number;
  config: Configuracion;
}): 'pendiente' | 'aprobada' | 'rechazada' {
  const total = totalAprobaciones + totalRechazos;
  if (total < config.minVotosSolicitud) return 'pendiente';
  const porcentaje = total === 0 ? 0 : Math.round((totalAprobaciones / total) * 100);
  return porcentaje >= config.porcentajeAprobacion ? 'aprobada' : 'rechazada';
}

export function evaluatePeticion({
  totalAprobaciones,
  totalRechazos,
  config
}: {
  totalAprobaciones: number;
  totalRechazos: number;
  config: Configuracion;
}): 'en_revision' | 'aprobada' | 'no_aprobada' {
  const total = totalAprobaciones + totalRechazos;
  if (total < config.minVotosPeticion) return 'en_revision';
  const porcentaje = total === 0 ? 0 : Math.round((totalAprobaciones / total) * 100);
  return porcentaje >= config.porcentajeAprobacion ? 'aprobada' : 'no_aprobada';
}

export function updateCounters(current: { totalAprobaciones: number; totalRechazos: number }, voto: TipoVoto) {
  return voto === 'aprobar'
    ? { ...current, totalAprobaciones: current.totalAprobaciones + 1 }
    : { ...current, totalRechazos: current.totalRechazos + 1 };
}
