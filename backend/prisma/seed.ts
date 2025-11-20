import { PrismaClient, EstadoMiembro, RolUsuario } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@consejo.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.configuracion.upsert({
    where: { id: 1 },
    create: {},
    update: {}
  });

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash,
      displayName: 'Admin Consejo',
      estadoMiembro: EstadoMiembro.miembro_aprobado,
      rol: RolUsuario.admin
    },
    update: {}
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
