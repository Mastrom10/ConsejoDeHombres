import { evaluatePeticion, evaluateThreshold } from '../services/rulesService';
import { Configuracion } from '@prisma/client';

const config: Configuracion = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  minVotosPeticion: 5,
  minVotosSolicitud: 3,
  porcentajeAprobacion: 70
};

describe('Reglas de solicitudes', () => {
  it('permanece pendiente con pocos votos', () => {
    expect(evaluateThreshold({ totalAprobaciones: 1, totalRechazos: 0, config })).toBe('pendiente');
  });
  it('aprueba cuando supera el umbral', () => {
    expect(evaluateThreshold({ totalAprobaciones: 3, totalRechazos: 1, config })).toBe('aprobada');
  });
  it('rechaza con mayoría negativa', () => {
    expect(evaluateThreshold({ totalAprobaciones: 1, totalRechazos: 3, config })).toBe('rechazada');
  });
});

describe('Reglas de peticiones', () => {
  it('en revisión si no alcanza votos mínimos', () => {
    expect(evaluatePeticion({ totalAprobaciones: 2, totalRechazos: 1, config })).toBe('en_revision');
  });
  it('aprueba con 70% o más', () => {
    expect(evaluatePeticion({ totalAprobaciones: 7, totalRechazos: 2, config: { ...config, minVotosPeticion: 5 } })).toBe('aprobada');
  });
  it('no aprueba si no alcanza porcentaje', () => {
    expect(evaluatePeticion({ totalAprobaciones: 3, totalRechazos: 3, config: { ...config, minVotosPeticion: 5 } })).toBe('no_aprobada');
  });
});
