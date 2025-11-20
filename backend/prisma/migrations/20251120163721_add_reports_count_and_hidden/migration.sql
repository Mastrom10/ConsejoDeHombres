-- CreateEnum
CREATE TYPE "EstadoMiembro" AS ENUM ('pendiente_aprobacion', 'miembro_aprobado', 'rechazado', 'baneado');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('miembro', 'admin', 'moderador');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('pendiente', 'aprobada', 'rechazada');

-- CreateEnum
CREATE TYPE "EstadoPeticion" AS ENUM ('en_revision', 'aprobada', 'no_aprobada', 'cerrada');

-- CreateEnum
CREATE TYPE "TipoVoto" AS ENUM ('aprobar', 'rechazar');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "avatarUrl" TEXT,
    "genero" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "edad" INTEGER,
    "estadoMiembro" "EstadoMiembro" NOT NULL DEFAULT 'pendiente_aprobacion',
    "rol" "RolUsuario" NOT NULL DEFAULT 'miembro',
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudMiembro" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "textoSolicitud" TEXT NOT NULL,
    "fotoSolicitudUrl" TEXT NOT NULL,
    "estadoSolicitud" "EstadoSolicitud" NOT NULL DEFAULT 'pendiente',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),
    "totalAprobaciones" INTEGER NOT NULL DEFAULT 0,
    "totalRechazos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SolicitudMiembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudVoto" (
    "id" TEXT NOT NULL,
    "solicitudId" TEXT NOT NULL,
    "miembroVotanteId" TEXT NOT NULL,
    "tipoVoto" "TipoVoto" NOT NULL,
    "mensaje" TEXT,
    "fechaVoto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolicitudVoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Peticion" (
    "id" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenes" TEXT[],
    "videoUrl" TEXT,
    "estadoPeticion" "EstadoPeticion" NOT NULL DEFAULT 'en_revision',
    "likes" INTEGER NOT NULL DEFAULT 0,
    "reportesCount" INTEGER NOT NULL DEFAULT 0,
    "oculta" BOOLEAN NOT NULL DEFAULT false,
    "totalAprobaciones" INTEGER NOT NULL DEFAULT 0,
    "totalRechazos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),

    CONSTRAINT "Peticion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeticionVoto" (
    "id" TEXT NOT NULL,
    "peticionId" TEXT NOT NULL,
    "miembroVotanteId" TEXT NOT NULL,
    "tipoVoto" "TipoVoto" NOT NULL,
    "mensaje" TEXT,
    "fechaVoto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeticionVoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeticionLike" (
    "id" TEXT NOT NULL,
    "peticionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeticionLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "minVotosSolicitud" INTEGER NOT NULL DEFAULT 10,
    "minVotosPeticion" INTEGER NOT NULL DEFAULT 100,
    "porcentajeAprobacion" INTEGER NOT NULL DEFAULT 70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "peticionId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SolicitudVoto_solicitudId_miembroVotanteId_key" ON "SolicitudVoto"("solicitudId", "miembroVotanteId");

-- CreateIndex
CREATE INDEX "Peticion_estadoPeticion_idx" ON "Peticion"("estadoPeticion");

-- CreateIndex
CREATE INDEX "Peticion_createdAt_idx" ON "Peticion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PeticionVoto_peticionId_miembroVotanteId_key" ON "PeticionVoto"("peticionId", "miembroVotanteId");

-- CreateIndex
CREATE UNIQUE INDEX "PeticionLike_peticionId_usuarioId_key" ON "PeticionLike"("peticionId", "usuarioId");

-- AddForeignKey
ALTER TABLE "SolicitudMiembro" ADD CONSTRAINT "SolicitudMiembro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudVoto" ADD CONSTRAINT "SolicitudVoto_solicitudId_fkey" FOREIGN KEY ("solicitudId") REFERENCES "SolicitudMiembro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudVoto" ADD CONSTRAINT "SolicitudVoto_miembroVotanteId_fkey" FOREIGN KEY ("miembroVotanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Peticion" ADD CONSTRAINT "Peticion_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeticionVoto" ADD CONSTRAINT "PeticionVoto_peticionId_fkey" FOREIGN KEY ("peticionId") REFERENCES "Peticion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeticionVoto" ADD CONSTRAINT "PeticionVoto_miembroVotanteId_fkey" FOREIGN KEY ("miembroVotanteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeticionLike" ADD CONSTRAINT "PeticionLike_peticionId_fkey" FOREIGN KEY ("peticionId") REFERENCES "Peticion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeticionLike" ADD CONSTRAINT "PeticionLike_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_peticionId_fkey" FOREIGN KEY ("peticionId") REFERENCES "Peticion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
