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
    const token = signToken({ id: user.id, email: user.email, rol: user.rol, estadoMiembro: user.estadoMiembro });
    res.json({ token, user });
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
    const token = signToken({ id: user.id, email: user.email, rol: user.rol, estadoMiembro: user.estadoMiembro });
    res.json({ token, user });
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
