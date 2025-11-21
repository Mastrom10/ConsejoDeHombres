import { Router } from 'express';
import { authenticate, requireMember } from '../middlewares/auth';
import { prisma } from '../config/prisma';
import { solicitudSchema, votoSolicitudSchema } from '../dtos/solicitudDtos';
import { evaluateThreshold, requiredValidationsByUserCount } from '../services/rulesService';
import { EstadoMiembro, EstadoSolicitud } from '@prisma/client';
import { consumirVoto } from '../services/votosService';
import { uploadImages } from '../middlewares/upload';
import { uploadImageToS3 } from '../services/s3Service';

const router = Router();

// Endpoint para subir foto de solicitud (solo requiere autenticación, no ser miembro aprobado)
router.post('/upload-foto', authenticate, uploadImages.single('foto'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó una imagen' });
    }

    const imageUrl = await uploadImageToS3(req.file, 'solicitudes');
    res.json({ url: imageUrl });
  } catch (e) {
    next(e);
  }
});

router.get('/', async (_req, res) => {
  // Obtener solicitudes existentes
  const solicitudes = await prisma.solicitudMiembro.findMany({
    include: { usuario: true },
    orderBy: { fechaCreacion: 'desc' }
  });

  // Obtener usuarios pendientes que no tengan solicitud
  const usuariosPendientes = await prisma.usuario.findMany({
    where: {
      estadoMiembro: EstadoMiembro.pendiente_aprobacion,
      solicitudes: {
        none: {}
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Crear solicitudes "virtuales" para usuarios pendientes sin solicitud
  // Solo mostrar usuarios que realmente no tienen solicitud (no los que están esperando completarla)
  const solicitudesVirtuales = usuariosPendientes
    .filter(usuario => {
      // No mostrar como virtual si el usuario acaba de registrarse y aún no completó la solicitud
      // Solo mostrar si lleva más de 1 hora sin completar (para evitar mostrar usuarios que están en proceso)
      const horasDesdeRegistro = (new Date().getTime() - usuario.createdAt.getTime()) / (1000 * 60 * 60);
      return horasDesdeRegistro > 1;
    })
    .map(usuario => ({
      id: `virtual-${usuario.id}`,
      usuarioId: usuario.id,
      textoSolicitud: `Solicitud de ingreso de ${usuario.displayName}. Usuario registrado el ${new Date(usuario.createdAt).toLocaleDateString()}.`,
      fotoSolicitudUrl: usuario.avatarUrl || '/img/default-avatar.png',
      cartaSolicitud: null,
      redesSociales: null,
      codigoAceptado: false,
      estadoSolicitud: 'pendiente' as EstadoSolicitud,
      fechaCreacion: usuario.createdAt,
      fechaResolucion: null as Date | null,
      totalAprobaciones: 0,
      totalRechazos: 0,
      usuario: {
        id: usuario.id,
        displayName: usuario.displayName,
        avatarUrl: usuario.avatarUrl,
        email: usuario.email
      },
      esVirtual: true // Flag para identificar solicitudes virtuales
    }));

  // Combinar solicitudes reales y virtuales
  const todasLasSolicitudes = [
    ...solicitudes.map(s => ({ ...s, esVirtual: false })),
    ...solicitudesVirtuales
  ].sort((a, b) => {
    const fechaA = a.fechaCreacion.getTime();
    const fechaB = b.fechaCreacion.getTime();
    return fechaB - fechaA;
  });

  res.json(todasLasSolicitudes);
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const parsed = solicitudSchema.parse(req.body);
    
    // Verificar si ya tiene una solicitud
    const solicitudExistente = await prisma.solicitudMiembro.findFirst({
      where: { usuarioId: req.user!.id }
    });
    
    if (solicitudExistente) {
      return res.status(400).json({ message: 'Ya tienes una solicitud en proceso' });
    }

    const solicitud = await prisma.solicitudMiembro.create({
      data: {
        usuarioId: req.user!.id,
        textoSolicitud: parsed.textoSolicitud,
        fotoSolicitudUrl: parsed.fotoSolicitudUrl,
        cartaSolicitud: parsed.cartaSolicitud || null,
        redesSociales: parsed.redesSociales || null,
        codigoAceptado: parsed.codigoAceptado
      }
    });
    res.status(201).json(solicitud);
  } catch (e) {
    next(e);
  }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const parsed = solicitudSchema.parse(req.body);
    
    // Buscar la solicitud del usuario
    const solicitudExistente = await prisma.solicitudMiembro.findFirst({
      where: { usuarioId: req.user!.id }
    });
    
    if (!solicitudExistente) {
      return res.status(404).json({ message: 'No tienes una solicitud para modificar' });
    }
    
    // Solo permitir modificar si está pendiente
    if (solicitudExistente.estadoSolicitud !== 'pendiente') {
      return res.status(400).json({ message: 'Solo puedes modificar solicitudes pendientes' });
    }

    const solicitud = await prisma.solicitudMiembro.update({
      where: { id: solicitudExistente.id },
      data: {
        textoSolicitud: parsed.textoSolicitud,
        fotoSolicitudUrl: parsed.fotoSolicitudUrl,
        cartaSolicitud: parsed.cartaSolicitud || null,
        redesSociales: parsed.redesSociales || null,
        codigoAceptado: parsed.codigoAceptado
      }
    });
    res.json(solicitud);
  } catch (e) {
    next(e);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const solicitud = await prisma.solicitudMiembro.findFirst({
      where: { usuarioId: req.user!.id },
      include: { usuario: true }
    });
    
    if (!solicitud) {
      return res.status(404).json({ message: 'No tienes una solicitud' });
    }
    
    res.json(solicitud);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/votar', authenticate, requireMember, async (req, res, next) => {
  try {
    const parsed = votoSolicitudSchema.parse(req.body);
    let solicitudId = req.params.id;

    // Si es una solicitud virtual, crear la solicitud real primero
    let solicitud = null;
    if (solicitudId.startsWith('virtual-')) {
      const usuarioId = solicitudId.replace('virtual-', '');
      const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
      if (!usuario || usuario.estadoMiembro !== EstadoMiembro.pendiente_aprobacion) {
        return res.status(404).json({ message: 'Usuario no encontrado o ya procesado' });
      }
      
      // Crear la solicitud real
      solicitud = await prisma.solicitudMiembro.create({
        data: {
          usuarioId: usuario.id,
          textoSolicitud: `Solicitud de ingreso de ${usuario.displayName}. Usuario registrado el ${new Date(usuario.createdAt).toLocaleDateString()}.`,
          fotoSolicitudUrl: usuario.avatarUrl || '/img/default-avatar.png',
          cartaSolicitud: null,
          redesSociales: null,
          codigoAceptado: false
        }
      });
      solicitudId = solicitud.id;
    } else {
      solicitud = await prisma.solicitudMiembro.findUnique({ where: { id: solicitudId } });
      if (!solicitud) {
        return res.status(404).json({ message: 'Solicitud no encontrada' });
      }
    }

    // Verificar si ya votó esta solicitud
    const votoExistente = await prisma.solicitudVoto.findFirst({
      where: {
        solicitudId,
        miembroVotanteId: req.user!.id
      }
    });

    // Solo consumir voto si es un voto nuevo
    const esVotoNuevo = !votoExistente;
    if (esVotoNuevo) {
      const tieneVoto = await consumirVoto(req.user!.id);
      if (!tieneVoto) {
        return res.status(429).json({ message: 'No tienes votos disponibles. Espera a que se regeneren.' });
      }
    }

    // Limitar a 3 validaciones (aprobar) por día y por usuario
    if (parsed.tipoVoto === 'aprobar' && esVotoNuevo) {
      const inicioHoy = new Date();
      inicioHoy.setUTCHours(0, 0, 0, 0);
      const aprobacionesHoy = await prisma.solicitudVoto.count({
        where: {
          miembroVotanteId: req.user!.id,
          tipoVoto: 'aprobar',
          fechaVoto: { gte: inicioHoy }
        }
      });
      if (aprobacionesHoy >= 3) {
        return res.status(429).json({ message: 'Has alcanzado el máximo de 3 validaciones diarias.' });
      }
    }
    
    let voto;
    if (votoExistente) {
      // Actualizar voto existente
      voto = await prisma.solicitudVoto.update({
        where: { id: votoExistente.id },
        data: {
          tipoVoto: parsed.tipoVoto,
          mensaje: parsed.mensaje,
          fechaVoto: new Date()
        }
      });
    } else {
      // Crear nuevo voto
      voto = await prisma.solicitudVoto.create({
        data: {
          solicitudId,
          miembroVotanteId: req.user!.id,
          tipoVoto: parsed.tipoVoto,
          mensaje: parsed.mensaje
        }
      });
    }
    const totalUsuarios = await prisma.usuario.count();
    const requiredValidations = requiredValidationsByUserCount(totalUsuarios);
    const totals = {
      totalAprobaciones: (solicitud?.totalAprobaciones || 0) + (parsed.tipoVoto === 'aprobar' ? 1 : 0),
      totalRechazos: (solicitud?.totalRechazos || 0) + (parsed.tipoVoto === 'rechazar' ? 1 : 0)
    };
    const estado = evaluateThreshold({
      totalAprobaciones: totals.totalAprobaciones,
      totalRechazos: totals.totalRechazos,
      requiredValidations
    });
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
