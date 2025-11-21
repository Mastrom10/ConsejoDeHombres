import { z } from 'zod';

export const createPeticionSchema = z.object({
  titulo: z.string().min(5),
  descripcion: z.string().min(10),
  imagenes: z.array(z.string().url()).max(5).optional().default([]),
  videoUrl: z.string().url().optional()
});

export const votoPeticionSchema = z.object({
  tipoVoto: z.enum(['aprobar', 'rechazar', 'debatir']),
  mensaje: z.string().optional()
}).refine((data) => {
  // Mensaje obligatorio para rechazar o debatir
  if (data.tipoVoto === 'rechazar' || data.tipoVoto === 'debatir') {
    return data.mensaje && data.mensaje.length > 3;
  }
  return true;
}, {
  message: 'Mensaje obligatorio para rechazar o debatir'
});
