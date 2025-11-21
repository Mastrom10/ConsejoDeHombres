import { prisma } from '../config/prisma';

export async function regenerarVotosUsuario(userId: string) {
  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({ data: {} });
    return;
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) return;

  const maxVotos = config.maxVotosDisponibles;
  const minutosRegeneracion = config.minutosRegeneracionVoto;
  const ahora = new Date();
  const ultimaRegeneracion = usuario.ultimaRegeneracionVoto;
  const diferenciaMs = ahora.getTime() - ultimaRegeneracion.getTime();
  const diferenciaMinutos = diferenciaMs / (1000 * 60);

  // Calcular cuántos votos se pueden regenerar
  const votosARegenerar = Math.floor(diferenciaMinutos / minutosRegeneracion);
  
  if (votosARegenerar > 0) {
    const nuevosVotos = Math.min(usuario.votosDisponibles + votosARegenerar, maxVotos);
    const nuevaUltimaRegeneracion = new Date(
      ultimaRegeneracion.getTime() + (votosARegenerar * minutosRegeneracion * 60 * 1000)
    );

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        votosDisponibles: nuevosVotos,
        ultimaRegeneracionVoto: nuevaUltimaRegeneracion
      }
    });
  }
}

export async function consumirVoto(userId: string): Promise<boolean> {
  await regenerarVotosUsuario(userId);
  
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) return false;

  if (usuario.votosDisponibles <= 0) {
    return false;
  }

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      votosDisponibles: { decrement: 1 }
    }
  });

  return true;
}

export async function obtenerEstadoVotos(userId: string) {
  const config = await prisma.configuracion.findFirst();
  if (!config) {
    await prisma.configuracion.create({ data: {} });
    return { votosDisponibles: 10, tiempoRestante: 0, maxVotos: 10, minutosRegeneracion: 2 };
  }

  await regenerarVotosUsuario(userId);
  
  const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!usuario) {
    return { votosDisponibles: 0, tiempoRestante: 0, maxVotos: config.maxVotosDisponibles, minutosRegeneracion: config.minutosRegeneracionVoto };
  }

  const maxVotos = config.maxVotosDisponibles;
  const minutosRegeneracion = config.minutosRegeneracionVoto;
  
  // Si ya tiene el máximo, no hay tiempo restante
  if (usuario.votosDisponibles >= maxVotos) {
    return {
      votosDisponibles: usuario.votosDisponibles,
      tiempoRestante: 0,
      maxVotos,
      minutosRegeneracion
    };
  }

  // Calcular tiempo restante hasta el próximo voto
  const ahora = new Date();
  const ultimaRegeneracion = usuario.ultimaRegeneracionVoto;
  const diferenciaMs = ahora.getTime() - ultimaRegeneracion.getTime();
  const diferenciaMinutos = diferenciaMs / (1000 * 60);
  const minutosRestantes = minutosRegeneracion - (diferenciaMinutos % minutosRegeneracion);
  // Asegurar que no sea negativo
  const minutosRestantesAjustados = Math.max(0, minutosRestantes);
  const segundosRestantes = Math.ceil(minutosRestantesAjustados * 60);

  return {
    votosDisponibles: usuario.votosDisponibles,
    tiempoRestante: segundosRestantes,
    maxVotos,
    minutosRegeneracion
  };
}

