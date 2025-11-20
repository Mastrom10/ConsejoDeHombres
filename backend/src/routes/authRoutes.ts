import { Router } from 'express';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { prisma } from '../config/prisma';
import { loginSchema, registerSchema } from '../dtos/authDtos';
import { signToken } from '../utils/jwt';
import { EstadoMiembro } from '@prisma/client';
import { env } from '../config/env';

const router = Router();

router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(parsed.password, 10);

    // Contar usuarios existentes para aplicar reglas de auto-aprobación
    const totalUsuarios = await prisma.usuario.count();
    const esPrimerosCien = totalUsuarios < 100;

    const user = await prisma.usuario.create({
      data: {
        email: parsed.email,
        passwordHash: hash,
        displayName: parsed.displayName,
        genero: parsed.genero,
        edad: parsed.edad,
        avatarUrl: parsed.avatarUrl,
        estadoMiembro: esPrimerosCien ? EstadoMiembro.miembro_aprobado : EstadoMiembro.pendiente_aprobacion
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

export default router;
