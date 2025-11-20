-- CreateEnum
CREATE TYPE "TipoReaccionVoto" AS ENUM ('up', 'down');

-- CreateTable
CREATE TABLE "PeticionVotoReaction" (
    "id" TEXT NOT NULL,
    "votoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoReaccionVoto" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeticionVotoReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeticionVotoReaction_votoId_usuarioId_key" ON "PeticionVotoReaction"("votoId", "usuarioId");

-- AddForeignKey
ALTER TABLE "PeticionVotoReaction" ADD CONSTRAINT "PeticionVotoReaction_votoId_fkey" FOREIGN KEY ("votoId") REFERENCES "PeticionVoto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeticionVotoReaction" ADD CONSTRAINT "PeticionVotoReaction_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
