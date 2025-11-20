import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { EstadoMiembro, RolUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      rol: RolUsuario;
      estadoMiembro: EstadoMiembro;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });
  const [, token] = authHeader.split(' ');
  try {
    const payload = jwt.verify(token, env.jwtSecret) as Express.UserPayload;
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}

export function requireMember(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  if (req.user.estadoMiembro !== EstadoMiembro.miembro_aprobado) {
    return res.status(403).json({ message: 'Se requiere ser miembro aprobado' });
  }
  next();
}

export function requireRole(roles: RolUsuario[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    return next();
  };
}

export async function refreshUser(req: Request, _res: Response, next: NextFunction) {
  if (req.user) {
    const dbUser = await prisma.usuario.findUnique({ where: { id: req.user.id } });
    if (dbUser) {
      req.user.estadoMiembro = dbUser.estadoMiembro;
      req.user.rol = dbUser.rol;
    }
  }
  next();
}
