import { z } from 'zod';

export const solicitudSchema = z.object({
  textoSolicitud: z.string().min(20),
  fotoSolicitudUrl: z.string().url()
});

export const votoSolicitudSchema = z.object({
  tipoVoto: z.enum(['aprobar', 'rechazar']),
  mensaje: z.string().optional()
}).refine((data) => data.tipoVoto === 'aprobar' || (data.mensaje && data.mensaje.length > 3), {
  message: 'Mensaje obligatorio para rechazos'
});
