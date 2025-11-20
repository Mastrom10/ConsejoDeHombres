import { PrismaClient, EstadoMiembro, RolUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@consejo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'cocacola';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.configuracion.upsert({
    where: { id: 1 },
    create: {},
    update: {}
  });

  // Crear ADMIN supremo
  await prisma.usuario.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: 'Gran Maestre del Consejo',
      estadoMiembro: EstadoMiembro.miembro_aprobado,
      rol: RolUsuario.admin
    },
    update: {
      passwordHash,
      estadoMiembro: EstadoMiembro.miembro_aprobado,
      rol: RolUsuario.admin
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
