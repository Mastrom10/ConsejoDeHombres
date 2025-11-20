import { Router } from 'express';
import { authenticate, requireMember } from '../middlewares/auth';
import { prisma } from '../config/prisma';
import { solicitudSchema, votoSolicitudSchema } from '../dtos/solicitudDtos';
import { evaluateThreshold } from '../services/rulesService';
import { EstadoMiembro, EstadoSolicitud } from '@prisma/client';

const router = Router();

router.get('/', async (_req, res) => {
  const solicitudes = await prisma.solicitudMiembro.findMany({
    include: { usuario: true },
    orderBy: { fechaCreacion: 'desc' }
  });
  res.json(solicitudes);
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const parsed = solicitudSchema.parse(req.body);
    const solicitud = await prisma.solicitudMiembro.create({
      data: {
        usuarioId: req.user!.id,
        textoSolicitud: parsed.textoSolicitud,
        fotoSolicitudUrl: parsed.fotoSolicitudUrl
      }
    });
    res.status(201).json(solicitud);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/votar', authenticate, requireMember, async (req, res, next) => {
  try {
    const parsed = votoSolicitudSchema.parse(req.body);
    const solicitudId = req.params.id;
    const voto = await prisma.solicitudVoto.create({
      data: {
        solicitudId,
        miembroVotanteId: req.user!.id,
        tipoVoto: parsed.tipoVoto,
        mensaje: parsed.mensaje
      }
    });
    const solicitud = await prisma.solicitudMiembro.findUnique({ where: { id: solicitudId } });
    const config = (await prisma.configuracion.findFirst())!;
    const totals = {
      totalAprobaciones: (solicitud?.totalAprobaciones || 0) + (parsed.tipoVoto === 'aprobar' ? 1 : 0),
      totalRechazos: (solicitud?.totalRechazos || 0) + (parsed.tipoVoto === 'rechazar' ? 1 : 0)
    };
    const estado = evaluateThreshold({ totalAprobaciones: totals.totalAprobaciones, totalRechazos: totals.totalRechazos, config });
    await prisma.solicitudMiembro.update({
      where: { id: solicitudId },
      data: {
        totalAprobaciones: totals.totalAprobaciones,
        totalRechazos: totals.totalRechazos,
        estadoSolicitud: estado as EstadoSolicitud,
        fechaResolucion: estado === 'pendiente' ? undefined : new Date()
      }
    });
    if (estado === 'aprobada') {
      await prisma.usuario.update({ where: { id: solicitud!.usuarioId }, data: { estadoMiembro: EstadoMiembro.miembro_aprobado } });
    } else if (estado === 'rechazada') {
      await prisma.usuario.update({ where: { id: solicitud!.usuarioId }, data: { estadoMiembro: EstadoMiembro.rechazado } });
    }
    res.json({ voto, estado });
  } catch (e) {
    next(e);
  }
});

export default router;
