import { Router } from 'express';
import { prisma } from '../config/prisma';
import { authenticate, requireRole } from '../middlewares/auth';
import { RolUsuario } from '@prisma/client';

const router = Router();

router.use(authenticate, requireRole([RolUsuario.admin, RolUsuario.moderador]));

router.get('/config', async (_req, res) => {
  const config = await prisma.configuracion.findFirst();
  res.json(config);
});

router.put('/config', async (req, res) => {
  const { minVotosSolicitud, minVotosPeticion, porcentajeAprobacion } = req.body;
  const config = await prisma.configuracion.upsert({
    where: { id: 1 },
    create: {
      minVotosPeticion: minVotosPeticion ?? 100,
      minVotosSolicitud: minVotosSolicitud ?? 10,
      porcentajeAprobacion: porcentajeAprobacion ?? 70
    },
    update: {
      minVotosPeticion,
      minVotosSolicitud,
      porcentajeAprobacion
    }
  });
  res.json(config);
});

router.put('/usuarios/:id/estado', async (req, res) => {
  const { estadoMiembro, rol } = req.body;
  const user = await prisma.usuario.update({ where: { id: req.params.id }, data: { estadoMiembro, rol } });
  res.json(user);
});

router.get('/reportes', async (_req, res) => {
  const reportes = await prisma.reporte.findMany({ include: { autor: true, peticion: true } });
  res.json(reportes);
});

router.post('/reportes', async (req, res) => {
  const reporte = await prisma.reporte.create({ data: req.body });
  res.status(201).json(reporte);
});

export default router;
