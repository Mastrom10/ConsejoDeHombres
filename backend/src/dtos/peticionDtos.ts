import { z } from 'zod';

export const createPeticionSchema = z.object({
  titulo: z.string().min(5),
  descripcion: z.string().min(10),
  imagenes: z.array(z.string().url()).max(5).optional().default([]),
  videoUrl: z.string().url().optional()
});

export const votoPeticionSchema = z.object({
  tipoVoto: z.enum(['aprobar', 'rechazar']),
  mensaje: z.string().optional()
}).refine((data) => data.tipoVoto === 'aprobar' || (data.mensaje && data.mensaje.length > 3), {
  message: 'Mensaje obligatorio en caso de rechazo'
});
