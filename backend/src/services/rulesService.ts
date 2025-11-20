import { Configuracion, TipoVoto } from '@prisma/client';

/**
 * Regla dinámica de cuántas validaciones (aprobaciones) se requieren
 * según la cantidad total de usuarios del sistema.
 */
export function requiredValidationsByUserCount(totalUsuarios: number): number {
  if (totalUsuarios <= 100) return 0; // primeros 100 no requieren validación
  if (totalUsuarios <= 1000) return 1;
  if (totalUsuarios <= 3000) return 2;
  if (totalUsuarios <= 5000) return 3;
  if (totalUsuarios <= 10000) return 5;
  return 10;
}

export function evaluateThreshold({
  totalAprobaciones,
  totalRechazos,
  requiredValidations
}: {
  totalAprobaciones: number;
  totalRechazos: number;
  requiredValidations: number;
}): 'pendiente' | 'aprobada' | 'rechazada' {
  // Si no se requiere ninguna validación, se aprueba automáticamente.
  if (requiredValidations === 0) return 'aprobada';

  if (totalAprobaciones >= requiredValidations) return 'aprobada';
  if (totalRechazos >= requiredValidations) return 'rechazada';
  return 'pendiente';
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
