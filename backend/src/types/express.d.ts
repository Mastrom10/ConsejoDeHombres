import { EstadoMiembro, RolUsuario } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      rol: RolUsuario;
      estadoMiembro: EstadoMiembro;
    }
  }
}

export {};
