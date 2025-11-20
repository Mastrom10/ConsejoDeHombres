import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { EstadoMiembro, RolUsuario } from '@prisma/client';

export function signToken(params: { id: string; email: string; rol: RolUsuario; estadoMiembro: EstadoMiembro }) {
  return jwt.sign(params, env.jwtSecret, { expiresIn: '7d' });
}
