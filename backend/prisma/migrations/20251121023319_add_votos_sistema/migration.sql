-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "votosDisponibles" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Usuario" ADD COLUMN "ultimaRegeneracionVoto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Configuracion" ADD COLUMN "maxVotosDisponibles" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "Configuracion" ADD COLUMN "minutosRegeneracionVoto" INTEGER NOT NULL DEFAULT 2;
