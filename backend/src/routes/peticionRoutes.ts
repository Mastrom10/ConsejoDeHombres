import { Router } from 'express';
import { authenticate, requireMember } from '../middlewares/auth';
import { prisma } from '../config/prisma';
import { createPeticionSchema, votoPeticionSchema } from '../dtos/peticionDtos';
import { evaluatePeticion } from '../services/rulesService';
import { EstadoPeticion } from '@prisma/client';

const router = Router();

router.get('/', async (req, res) => {
  const filter = req.query.estado as EstadoPeticion | undefined;
  const peticiones = await prisma.peticion.findMany({
    where: {
      ...(filter ? { estadoPeticion: filter } : {}),
      oculta: false // Filtramos las ocultas por defecto
    },
    include: { autor: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(peticiones);
});

router.get('/populares', async (_req, res) => {
  const peticiones = await prisma.peticion.findMany({
    where: { oculta: false },
    take: 20,
    orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
    include: { autor: true }
  });
  res.json(peticiones);
});

router.post('/', authenticate, requireMember, async (req, res, next) => {
  try {
    const parsed = createPeticionSchema.parse(req.body);
    const peticion = await prisma.peticion.create({
      data: {
        autorId: req.user!.id,
        titulo: parsed.titulo,
        descripcion: parsed.descripcion,
        imagenes: parsed.imagenes || [],
        videoUrl: parsed.videoUrl
      }
    });
    res.status(201).json(peticion);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/reportar', authenticate, requireMember, async (req, res, next) => {
  try {
    const peticionId = req.params.id;
    const { descripcion } = req.body;

    // Verificar si ya reportó
    const existing = await prisma.reporte.findFirst({
      where: {
        autorId: req.user!.id,
        peticionId
      }
    });

    if (existing) {
      return res.status(400).json({ message: 'Ya has reportado esta petición' });
    }

    // Crear reporte
    await prisma.reporte.create({
      data: {
        autorId: req.user!.id,
        peticionId,
        tipo: 'contenido_inapropiado',
        descripcion: descripcion || 'Reporte de usuario'
      }
    });

    // Incrementar contador y chequear autohide
    const peticion = await prisma.peticion.update({
      where: { id: peticionId },
      data: { reportesCount: { increment: 1 } }
    });

    if (peticion.reportesCount >= 5) {
      await prisma.peticion.update({
        where: { id: peticionId },
        data: { oculta: true }
      });
      // Aquí podrías notificar a admins
    }

    res.json({ message: 'Reporte recibido', ocultada: peticion.reportesCount >= 5 });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/votar', authenticate, requireMember, async (req, res, next) => {
  try {
    const parsed = votoPeticionSchema.parse(req.body);
    const peticionId = req.params.id;

    try {
      await prisma.peticionVoto.create({
        data: {
          peticionId,
          miembroVotanteId: req.user!.id,
          tipoVoto: parsed.tipoVoto,
          mensaje: parsed.mensaje
        }
      });
    } catch (e: any) {
      // Manejar caso de voto duplicado (constraint única peticionId + miembroVotanteId)
      if (e?.code === 'P2002') {
        return res.status(400).json({ message: 'Ya has votado esta petición.' });
      }
      throw e;
    }

    const peticion = await prisma.peticion.findUnique({ where: { id: peticionId } });
    const config = (await prisma.configuracion.findFirst())!;
    const totals = {
      totalAprobaciones: (peticion?.totalAprobaciones || 0) + (parsed.tipoVoto === 'aprobar' ? 1 : 0),
      totalRechazos: (peticion?.totalRechazos || 0) + (parsed.tipoVoto === 'rechazar' ? 1 : 0)
    };
    const estado = evaluatePeticion({ totalAprobaciones: totals.totalAprobaciones, totalRechazos: totals.totalRechazos, config });
    await prisma.peticion.update({
      where: { id: peticionId },
      data: {
        totalAprobaciones: totals.totalAprobaciones,
        totalRechazos: totals.totalRechazos,
        estadoPeticion: estado as EstadoPeticion,
        fechaResolucion: estado === 'en_revision' ? undefined : new Date()
      }
    });
    res.json({ estado });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/like', authenticate, requireMember, async (req, res, next) => {
  try {
    const peticionId = req.params.id;
    await prisma.peticionLike.create({ data: { peticionId, usuarioId: req.user!.id } });
    await prisma.peticion.update({ where: { id: peticionId }, data: { likes: { increment: 1 } } });
    res.json({ liked: true });
  } catch (e) {
    next(e);
  }
});

export default router;