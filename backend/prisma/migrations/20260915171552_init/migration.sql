-- CreateTable
CREATE TABLE "Perfume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "olfactoryFamily" TEXT NOT NULL,
    "topNotes" TEXT NOT NULL,
    "heartNotes" TEXT NOT NULL,
    "baseNotes" TEXT NOT NULL,
    "intensity" TEXT NOT NULL,
    "imageUrl" TEXT,
    "model3dUrl" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Perfume_pkey" PRIMARY KEY ("id")
);
