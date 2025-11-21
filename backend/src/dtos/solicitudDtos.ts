import { z } from 'zod';

export const solicitudSchema = z.object({
  textoSolicitud: z.string().min(20),
  fotoSolicitudUrl: z.string().url(),
  cartaSolicitud: z.string().min(50).optional().nullable(),
  redesSociales: z.string().optional().nullable(), // JSON string con links
  codigoAceptado: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar el Código de Hombres para continuar'
  })
});

export const votoSolicitudSchema = z.object({
  tipoVoto: z.enum(['aprobar', 'rechazar']),
  mensaje: z.string().optional()
}).refine((data) => data.tipoVoto === 'aprobar' || (data.mensaje && data.mensaje.length > 3), {
  message: 'Mensaje obligatorio para rechazos'
});
