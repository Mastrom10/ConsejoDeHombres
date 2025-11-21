import { evaluatePeticion, evaluateThreshold, requiredValidationsByUserCount } from '../services/rulesService';
import { Configuracion } from '@prisma/client';

const config: Configuracion = {
  id: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  minVotosPeticion: 5,
  minVotosSolicitud: 3,
  porcentajeAprobacion: 70,
  maxVotosDisponibles: 10,
  minutosRegeneracionVoto: 2
};

describe('Reglas de solicitudes', () => {
  it('permanece pendiente si no alcanza las validaciones requeridas', () => {
    expect(evaluateThreshold({ totalAprobaciones: 0, totalRechazos: 0, requiredValidations: 1 })).toBe('pendiente');
  });
  it('aprueba cuando supera el umbral', () => {
    expect(evaluateThreshold({ totalAprobaciones: 2, totalRechazos: 0, requiredValidations: 2 })).toBe('aprobada');
  });
  it('rechaza con mayoría negativa', () => {
    expect(evaluateThreshold({ totalAprobaciones: 0, totalRechazos: 2, requiredValidations: 2 })).toBe('rechazada');
  });
});

describe('Regla dinámica de validaciones por cantidad de usuarios', () => {
  it('requiere 1 validación hasta 1000 usuarios', () => {
    expect(requiredValidationsByUserCount(50)).toBe(1);
    expect(requiredValidationsByUserCount(100)).toBe(1);
    expect(requiredValidationsByUserCount(1000)).toBe(1);
  });
  it('requiere 2 validaciones entre 1001 y 3000 usuarios', () => {
    expect(requiredValidationsByUserCount(1001)).toBe(2);
    expect(requiredValidationsByUserCount(3000)).toBe(2);
  });
  it('requiere 10 validaciones para más de 10000 usuarios', () => {
    expect(requiredValidationsByUserCount(15000)).toBe(10);
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
