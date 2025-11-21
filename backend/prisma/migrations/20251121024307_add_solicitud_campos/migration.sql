-- AlterTable
ALTER TABLE "SolicitudMiembro" ADD COLUMN "cartaSolicitud" TEXT;
ALTER TABLE "SolicitudMiembro" ADD COLUMN "redesSociales" TEXT;
ALTER TABLE "SolicitudMiembro" ADD COLUMN "codigoAceptado" BOOLEAN NOT NULL DEFAULT false;
