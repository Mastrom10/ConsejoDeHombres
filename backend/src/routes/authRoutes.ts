import { Router } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { prisma } from '../config/prisma';
import { loginSchema, registerSchema } from '../dtos/authDtos';
import { signToken } from '../utils/jwt';
import { EstadoMiembro } from '@prisma/client';
import { env } from '../config/env';
import { authenticate } from '../middlewares/auth';
import { obtenerEstadoVotos } from '../services/votosService';
import { requiredValidationsByUserCount } from '../services/rulesService';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.usuario.create({
      data: {
        email: parsed.email,
        passwordHash: hash,
        displayName: parsed.displayName,
        genero: parsed.genero,
        edad: parsed.edad,
        avatarUrl: parsed.avatarUrl,
        estadoMiembro: EstadoMiembro.pendiente_aprobacion
      }
    });
    // Cargar info de validaciones para el perfil
    const [validacionesRecibidas, validacionesOtorgadas] = await Promise.all([
      prisma.solicitudVoto.findMany({
        where: { solicitud: { usuarioId: user.id }, tipoVoto: 'aprobar' },
        include: { miembroVotante: { select: { id: true, displayName: true, avatarUrl: true } } }
      }),
      prisma.solicitudVoto.findMany({
        where: { miembroVotanteId: user.id, tipoVoto: 'aprobar' },
        include: { solicitud: { include: { usuario: { select: { id: true, displayName: true, avatarUrl: true } } } } }
      })
    ]);

    const perfilExtendido = {
      ...user,
      validadores: validacionesRecibidas.map(v => v.miembroVotante),
      validados: validacionesOtorgadas.map(v => v.solicitud!.usuario)
    };

    const token = signToken({ id: user.id, email: user.email, rol: user.rol, estadoMiembro: user.estadoMiembro });
    res.json({ token, user: perfilExtendido });
  } catch (e) {
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.usuario.findUnique({ where: { email: parsed.email } });
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Credenciales inválidas' });
    const valid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });
    const [validacionesRecibidas, validacionesOtorgadas] = await Promise.all([
      prisma.solicitudVoto.findMany({
        where: { solicitud: { usuarioId: user.id }, tipoVoto: 'aprobar' },
        include: { miembroVotante: { select: { id: true, displayName: true, avatarUrl: true } } }
      }),
      prisma.solicitudVoto.findMany({
        where: { miembroVotanteId: user.id, tipoVoto: 'aprobar' },
        include: { solicitud: { include: { usuario: { select: { id: true, displayName: true, avatarUrl: true } } } } }
      })
    ]);

    const perfilExtendido = {
      ...user,
      validadores: validacionesRecibidas.map(v => v.miembroVotante),
      validados: validacionesOtorgadas.map(v => v.solicitud!.usuario)
    };

    const token = signToken({ id: user.id, email: user.email, rol: user.rol, estadoMiembro: user.estadoMiembro });
    res.json({ token, user: perfilExtendido });
  } catch (e) {
    next(e);
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.frontendUrl}/login?error` }),
  (req, res) => {
    const user = req.user as any;
    const token = signToken({ id: user.id, email: user.email, rol: user.rol, estadoMiembro: user.estadoMiembro });
    res.redirect(`${env.frontendUrl}/auth/success?token=${token}`);
  }
);

// Devuelve el perfil completo del usuario autenticado usando el JWT
// Endpoint para obtener solo el estado de votos (más ligero)
router.get('/votos', authenticate, async (req, res, next) => {
  try {
    const estadoVotos = await obtenerEstadoVotos(req.user!.id);
    res.json(estadoVotos);
  } catch (e) {
    next(e);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.usuario.findUnique({ where: { id: req.user!.id } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const [validacionesRecibidas, validacionesOtorgadas] = await Promise.all([
      prisma.solicitudVoto.findMany({
        where: { solicitud: { usuarioId: user.id }, tipoVoto: 'aprobar' },
        include: { miembroVotante: { select: { id: true, displayName: true, avatarUrl: true } } }
      }),
      prisma.solicitudVoto.findMany({
        where: { miembroVotanteId: user.id, tipoVoto: 'aprobar' },
        include: { solicitud: { include: { usuario: { select: { id: true, displayName: true, avatarUrl: true } } } } }
      })
    ]);

    const estadoVotos = await obtenerEstadoVotos(user.id);

    const perfilExtendido = {
      ...user,
      validadores: validacionesRecibidas.map(v => v.miembroVotante),
      validados: validacionesOtorgadas.map(v => v.solicitud!.usuario),
      estadoVotos
    };

    res.json(perfilExtendido);
  } catch (e) {
    next(e);
  }
});

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    
    const [peticionesCreadas, votosEmitidos, solicitud] = await Promise.all([
      prisma.peticion.count({ where: { autorId: userId } }),
      prisma.peticionVoto.count({ where: { miembroVotanteId: userId } }),
      prisma.solicitudMiembro.findFirst({ 
        where: { usuarioId: userId },
        select: { totalAprobaciones: true, estadoSolicitud: true }
      })
    ]);

    // Calcular votos necesarios para la solicitud
    let votosNecesarios = 0;
    let votosActuales = 0;
    if (solicitud && solicitud.estadoSolicitud === 'pendiente') {
      const totalUsuarios = await prisma.usuario.count();
      votosNecesarios = requiredValidationsByUserCount(totalUsuarios);
      votosActuales = solicitud.totalAprobaciones;
    }

    res.json({
      peticionesCreadas,
      votosEmitidos,
      solicitud: solicitud ? {
        votosActuales,
        votosNecesarios,
        estadoSolicitud: solicitud.estadoSolicitud
      } : null
    });
  } catch (e) {
    next(e);
  }
});

router.delete('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

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

export default router;
