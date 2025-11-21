import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import { authenticate, requireRole } from '../middlewares/auth';
import { EstadoMiembro, EstadoPeticion, EstadoSolicitud, RolUsuario } from '@prisma/client';
import {
  adminPeticionUpdateSchema,
  adminSolicitudUpdateSchema,
  adminUserCreateSchema,
  adminUserUpdateSchema
} from '../dtos/adminDtos';

const router = Router();

router.use(authenticate, requireRole([RolUsuario.admin]));

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [totalUsuarios, aprobados, pendientes, baneados, admins, totalPeticiones, peticionesPorEstado, totalLikes, totalVotosPeticion, totalSolicitudes, solicitudesPorEstado, totalVotosSolicitud, reportesPendientes, reportesTotales] =
      await Promise.all([
        prisma.usuario.count(),
        prisma.usuario.count({ where: { estadoMiembro: EstadoMiembro.miembro_aprobado } }),
        prisma.usuario.count({ where: { estadoMiembro: EstadoMiembro.pendiente_aprobacion } }),
        prisma.usuario.count({ where: { estadoMiembro: EstadoMiembro.baneado } }),
        prisma.usuario.count({ where: { rol: RolUsuario.admin } }),
        prisma.peticion.count(),
        prisma.peticion.groupBy({ by: ['estadoPeticion'], _count: true }),
        prisma.peticion.aggregate({ _sum: { likes: true } }),
        prisma.peticionVoto.count(),
        prisma.solicitudMiembro.count(),
        prisma.solicitudMiembro.groupBy({ by: ['estadoSolicitud'], _count: true }),
        prisma.solicitudVoto.count(),
        prisma.reporte.count({ where: { estado: 'pendiente' } }),
        prisma.reporte.count()
      ]);

    res.json({
      usuarios: {
        total: totalUsuarios,
        aprobados,
        pendientes,
        baneados,
        admins
      },
      peticiones: {
        total: totalPeticiones,
        porEstado: peticionesPorEstado.reduce(
          (acc, curr) => ({ ...acc, [curr.estadoPeticion]: curr._count }),
          {} as Record<string, number>
        ),
        likes: totalLikes._sum.likes || 0,
        votos: totalVotosPeticion
      },
      solicitudes: {
        total: totalSolicitudes,
        porEstado: solicitudesPorEstado.reduce(
          (acc, curr) => ({ ...acc, [curr.estadoSolicitud]: curr._count }),
          {} as Record<string, number>
        ),
        votos: totalVotosSolicitud
      },
      reportes: {
        pendientes: reportesPendientes,
        total: reportesTotales
      }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/config', async (_req, res, next) => {
  try {
    const config = await prisma.configuracion.findFirst();
    res.json(config);
  } catch (e) {
    next(e);
  }
});

router.put('/config', async (req, res, next) => {
  try {
    const { 
      minVotosSolicitud, 
      minVotosPeticion, 
      porcentajeAprobacion,
      maxVotosDisponibles,
      minutosRegeneracionVoto
    } = req.body;
    const config = await prisma.configuracion.upsert({
      where: { id: 1 },
      create: {
        minVotosPeticion: minVotosPeticion ?? 100,
        minVotosSolicitud: minVotosSolicitud ?? 10,
        porcentajeAprobacion: porcentajeAprobacion ?? 70,
        maxVotosDisponibles: maxVotosDisponibles ?? 10,
        minutosRegeneracionVoto: minutosRegeneracionVoto ?? 2
      },
      update: {
        ...(minVotosPeticion !== undefined && { minVotosPeticion }),
        ...(minVotosSolicitud !== undefined && { minVotosSolicitud }),
        ...(porcentajeAprobacion !== undefined && { porcentajeAprobacion }),
        ...(maxVotosDisponibles !== undefined && { maxVotosDisponibles }),
        ...(minutosRegeneracionVoto !== undefined && { minutosRegeneracionVoto })
      }
    });
    res.json(config);
  } catch (e) {
    next(e);
  }
});

// USUARIOS
router.get('/usuarios', async (req, res, next) => {
  try {
    const search = (req.query.search as string) || '';
    const usuarios = await prisma.usuario.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { displayName: { contains: search, mode: 'insensitive' } }
            ]
          }
        : undefined,
      orderBy: { createdAt: 'desc' }
    });
    res.json(usuarios);
  } catch (e) {
    next(e);
  }
});

router.get('/usuarios/:id', async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.params.id } });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (e) {
    next(e);
  }
});

router.post('/usuarios', async (req, res, next) => {
  try {
    const parsed = adminUserCreateSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        email: parsed.email,
        passwordHash,
        displayName: parsed.displayName,
        estadoMiembro: parsed.estadoMiembro || EstadoMiembro.miembro_aprobado,
        rol: parsed.rol || RolUsuario.miembro,
        avatarUrl: parsed.avatarUrl,
        bio: parsed.bio,
        genero: parsed.genero,
        edad: parsed.edad
      }
    });
    res.status(201).json(usuario);
  } catch (e) {
    next(e);
  }
});

router.put('/usuarios/:id', async (req, res, next) => {
  try {
    const parsed = adminUserUpdateSchema.parse(req.body);
    const { password, ...rest } = parsed;
    const data = {
      ...rest,
      ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {})
    };

    const usuario = await prisma.usuario.update({ where: { id: req.params.id }, data });
    res.json(usuario);
  } catch (e) {
    next(e);
  }
});

router.delete('/usuarios/:id', async (req, res, next) => {
  try {
    const userId = req.params.id;
    await prisma.$transaction([
      prisma.peticionLike.deleteMany({ where: { usuarioId: userId } }),
      prisma.peticionVotoReaction.deleteMany({ where: { usuarioId: userId } }),
      prisma.peticionVoto.deleteMany({ where: { miembroVotanteId: userId } }),
      prisma.solicitudVoto.deleteMany({ where: { miembroVotanteId: userId } }),
      prisma.reporte.deleteMany({ where: { autorId: userId } }),
      prisma.solicitudMiembro.deleteMany({ where: { usuarioId: userId } }),
      prisma.peticion.deleteMany({ where: { autorId: userId } }),
      prisma.usuario.delete({ where: { id: userId } })
    ]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// PETICIONES
router.get('/peticiones', async (req, res, next) => {
  try {
    const estado = req.query.estado as EstadoPeticion | undefined;
    const incluirOcultas = req.query.ocultas !== 'false';
    const peticiones = await prisma.peticion.findMany({
      where: {
        ...(estado ? { estadoPeticion: estado } : {}),
        ...(incluirOcultas ? {} : { oculta: false })
      },
      include: { autor: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(peticiones);
  } catch (e) {
    next(e);
  }
});

router.put('/peticiones/:id', async (req, res, next) => {
  try {
    const parsed = adminPeticionUpdateSchema.parse(req.body);
    const peticion = await prisma.peticion.update({
      where: { id: req.params.id },
      data: parsed
    });
    res.json(peticion);
  } catch (e) {
    next(e);
  }
});

router.delete('/peticiones/:id', async (req, res, next) => {
  try {
    const peticionId = req.params.id;
    await prisma.$transaction([
      prisma.peticionVotoReaction.deleteMany({ where: { voto: { peticionId } } }),
      prisma.peticionVoto.deleteMany({ where: { peticionId } }),
      prisma.peticionLike.deleteMany({ where: { peticionId } }),
      prisma.reporte.deleteMany({ where: { peticionId } }),
      prisma.peticion.delete({ where: { id: peticionId } })
    ]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// SOLICITUDES
router.get('/solicitudes', async (_req, res, next) => {
  try {
    const solicitudes = await prisma.solicitudMiembro.findMany({
      include: { usuario: true },
      orderBy: { fechaCreacion: 'desc' }
    });
    res.json(solicitudes);
  } catch (e) {
    next(e);
  }
});

router.put('/solicitudes/:id', async (req, res, next) => {
  try {
    const parsed = adminSolicitudUpdateSchema.parse(req.body);
    const solicitud = await prisma.solicitudMiembro.update({
      where: { id: req.params.id },
      data: parsed
    });
    res.json(solicitud);
  } catch (e) {
    next(e);
  }
});

router.delete('/solicitudes/:id', async (req, res, next) => {
  try {
    const solicitudId = req.params.id;
    await prisma.$transaction([
      prisma.solicitudVoto.deleteMany({ where: { solicitudId } }),
      prisma.solicitudMiembro.delete({ where: { id: solicitudId } })
    ]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// REPORTES
router.get('/reportes', async (_req, res, next) => {
  try {
    const reportes = await prisma.reporte.findMany({ include: { autor: true, peticion: true } });
    res.json(reportes);
  } catch (e) {
    next(e);
  }
});

router.put('/reportes/:id', async (req, res, next) => {
  try {
    const { estado, descripcion } = req.body as { estado?: string; descripcion?: string };
    const reporte = await prisma.reporte.update({
      where: { id: req.params.id },
      data: { ...(estado ? { estado } : {}), ...(descripcion ? { descripcion } : {}) }
    });
    res.json(reporte);
  } catch (e) {
    next(e);
  }
});

router.post('/reportes', async (req, res, next) => {
  try {
    const reporte = await prisma.reporte.create({ data: req.body });
    res.status(201).json(reporte);
  } catch (e) {
    next(e);
  }
});

router.delete('/reportes/:id', async (req, res, next) => {
  try {
    await prisma.reporte.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
