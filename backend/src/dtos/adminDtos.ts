import { EstadoMiembro, EstadoPeticion, EstadoSolicitud, RolUsuario } from '@prisma/client';
import { z } from 'zod';

export const adminUserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2),
  estadoMiembro: z.nativeEnum(EstadoMiembro).optional(),
  rol: z.nativeEnum(RolUsuario).optional(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().optional(),
  genero: z.string().optional(),
  edad: z.number().int().nonnegative().optional()
});

export const adminUserUpdateSchema = adminUserCreateSchema
  .partial()
  .extend({ password: z.string().min(8).optional() })
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay datos para actualizar' });

export const adminPeticionUpdateSchema = z
  .object({
    titulo: z.string().min(3).optional(),
    descripcion: z.string().min(10).optional(),
    estadoPeticion: z.nativeEnum(EstadoPeticion).optional(),
    oculta: z.boolean().optional(),
    imagenes: z.array(z.string().url()).max(5).optional(),
    videoUrl: z.string().url().nullable().optional()
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay datos para actualizar' });

export const adminSolicitudUpdateSchema = z
  .object({
    estadoSolicitud: z.nativeEnum(EstadoSolicitud).optional(),
    textoSolicitud: z.string().min(5).optional(),
    fotoSolicitudUrl: z.string().url().optional()
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No hay datos para actualizar' });
