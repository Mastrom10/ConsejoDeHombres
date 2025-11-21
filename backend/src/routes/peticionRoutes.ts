import { Router } from 'express';
import { authenticate, requireMember } from '../middlewares/auth';
import { prisma } from '../config/prisma';
import { createPeticionSchema, votoPeticionSchema } from '../dtos/peticionDtos';
import { evaluatePeticion } from '../services/rulesService';
import { EstadoPeticion } from '@prisma/client';
import { uploadImages } from '../middlewares/upload';
import { uploadMultipleImagesToS3 } from '../services/s3Service';

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

// Detalle de una petición con historial de votos
router.get('/:id', async (req, res, next) => {
  try {
    const peticion = await prisma.peticion.findUnique({
      where: { id: req.params.id },
      include: {
        autor: true,
        votos: {
          include: {
            miembroVotante: { select: { id: true, displayName: true, avatarUrl: true } },
            reacciones: true
          },
          orderBy: { fechaVoto: 'desc' }
        }
      }
    });

    if (!peticion || peticion.oculta) {
      return res.status(404).json({ message: 'Petición no encontrada' });
    }

    const votosConReacciones = peticion.votos.map((v) => {
      const upCount = v.reacciones.filter((r) => r.tipo === 'up').length;
      const downCount = v.reacciones.filter((r) => r.tipo === 'down').length;
      const { reacciones, ...rest } = v;
      return { ...rest, upCount, downCount, myReaction: null };
    });

    res.json({ ...peticion, votos: votosConReacciones });
  } catch (e) {
    next(e);
  }
});

// Reaccionar a un voto (pulgar arriba/abajo)
router.post('/:peticionId/votos/:votoId/reaccion', authenticate, requireMember, async (req, res, next) => {
  try {
    const { peticionId, votoId } = req.params;
    const { tipo } = req.body as { tipo: 'up' | 'down' };

    if (tipo !== 'up' && tipo !== 'down') {
      return res.status(400).json({ message: 'Tipo de reacción inválido' });
    }

    const voto = await prisma.peticionVoto.findUnique({ where: { id: votoId } });
    if (!voto || voto.peticionId !== peticionId) {
      return res.status(404).json({ message: 'Voto no encontrado para esta petición' });
    }

    const existing = await prisma.peticionVotoReaction.findFirst({
      where: { votoId, usuarioId: req.user!.id }
    });

    if (existing && existing.tipo === tipo) {
      // Mismo tipo: quitar reacción (toggle off)
      await prisma.peticionVotoReaction.delete({ where: { id: existing.id } });
    } else if (existing) {
      // Cambiar de up a down o viceversa
      await prisma.peticionVotoReaction.update({
        where: { id: existing.id },
        data: { tipo }
      });
    } else {
      await prisma.peticionVotoReaction.create({
        data: {
          votoId,
          usuarioId: req.user!.id,
          tipo
        }
      });
    }

    // Devolver contadores actualizados para ese voto
    const updated = await prisma.peticionVoto.findUnique({
      where: { id: votoId },
      include: { reacciones: true }
    });

    const upCount = updated?.reacciones.filter((r) => r.tipo === 'up').length ?? 0;
    const downCount = updated?.reacciones.filter((r) => r.tipo === 'down').length ?? 0;
    const myReaction = updated?.reacciones.find((r) => r.usuarioId === req.user!.id)?.tipo ?? null;

    res.json({ upCount, downCount, myReaction });
  } catch (e) {
    next(e);
  }
});

// Endpoint para subir imágenes a S3
router.post('/upload', authenticate, requireMember, uploadImages.array('imagenes', 5), async (req, res, next) => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({ message: 'No se proporcionaron imágenes' });
    }

    const files = Array.isArray(req.files) ? req.files : [req.files];
    
    if (files.length > 5) {
      return res.status(400).json({ message: 'Máximo 5 imágenes permitidas' });
    }

    const imageUrls = await uploadMultipleImagesToS3(files as Express.Multer.File[]);
    res.json({ urls: imageUrls });
  } catch (e) {
    next(e);
  }
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

    const peticion = await prisma.peticion.findUnique({ where: { id: peticionId } });
    if (!peticion) {
      return res.status(404).json({ message: 'Petición no encontrada' });
    }
    if (peticion.autorId === req.user!.id) {
      return res.status(400).json({ message: 'No puedes votar tu propia petición.' });
    }

    // Buscar si ya existe un voto de este usuario
    const votoExistente = await prisma.peticionVoto.findUnique({
      where: {
        peticionId_miembroVotanteId: {
          peticionId,
          miembroVotanteId: req.user!.id
        }
      }
    });

    let votoAnterior: 'aprobar' | 'rechazar' | 'debatir' | null = null;
    if (votoExistente) {
      votoAnterior = votoExistente.tipoVoto as 'aprobar' | 'rechazar' | 'debatir';
      // Actualizar el voto existente
      await prisma.peticionVoto.update({
        where: { id: votoExistente.id },
        data: {
          tipoVoto: parsed.tipoVoto,
          mensaje: parsed.mensaje,
          fechaVoto: new Date() // Actualizar fecha del voto
        }
      });
    } else {
      // Crear nuevo voto
      await prisma.peticionVoto.create({
        data: {
          peticionId,
          miembroVotanteId: req.user!.id,
          tipoVoto: parsed.tipoVoto,
          mensaje: parsed.mensaje
        }
      });
    }

    // Calcular nuevos totales considerando el cambio de voto
    let nuevosAprobaciones = peticion.totalAprobaciones;
    let nuevosRechazos = peticion.totalRechazos;

    // Restar el voto anterior si existía
    if (votoAnterior === 'aprobar') {
      nuevosAprobaciones = Math.max(0, nuevosAprobaciones - 1);
    } else if (votoAnterior === 'rechazar') {
      nuevosRechazos = Math.max(0, nuevosRechazos - 1);
    }
    // 'debatir' no cuenta en los totales, así que no restamos nada

    // Sumar el nuevo voto (solo si no es 'debatir')
    if (parsed.tipoVoto === 'aprobar') {
      nuevosAprobaciones += 1;
    } else if (parsed.tipoVoto === 'rechazar') {
      nuevosRechazos += 1;
    }
    // 'debatir' no cuenta en los totales

    let config = await prisma.configuracion.findFirst();
    if (!config) {
      config = await prisma.configuracion.create({ data: {} });
    }
    const estado = evaluatePeticion({ 
      totalAprobaciones: nuevosAprobaciones, 
      totalRechazos: nuevosRechazos, 
      config 
    });
    
    await prisma.peticion.update({
      where: { id: peticionId },
      data: {
        totalAprobaciones: nuevosAprobaciones,
        totalRechazos: nuevosRechazos,
        estadoPeticion: estado as EstadoPeticion,
        fechaResolucion: estado === 'en_revision' ? undefined : new Date()
      }
    });
    res.json({ estado, actualizado: !!votoExistente });
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