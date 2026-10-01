/*
  Warnings:

  - You are about to drop the `Perfume` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINE', 'FEMININE', 'UNISEX');

-- CreateEnum
CREATE TYPE "Concentration" AS ENUM ('EAU_DE_COLOGNE', 'EAU_DE_TOILETTE', 'EAU_DE_PARFUM', 'PARFUM', 'EXTRAIT', 'PERFUME_OIL');

-- CreateEnum
CREATE TYPE "NoteLevel" AS ENUM ('TOP', 'HEART', 'BASE');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'AUTUMN', 'WINTER');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('DAY', 'NIGHT');

-- CreateEnum
CREATE TYPE "BottleShape" AS ENUM ('ROUND', 'SQUARE', 'RECTANGLE', 'CYLINDER', 'PEBBLE', 'FACETED');

-- DropTable
DROP TABLE "Perfume";

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "website" TEXT,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fragrance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "year" INTEGER,
    "gender" "Gender" NOT NULL,
    "concentration" "Concentration",
    "family" TEXT,
    "description" TEXT,
    "longevity" INTEGER,
    "sillage" INTEGER,
    "seasons" "Season"[],
    "timesOfDay" "TimeOfDay"[],
    "rating" DOUBLE PRECISION,
    "ratingCount" INTEGER,
    "bottleShape" "BottleShape" NOT NULL DEFAULT 'RECTANGLE',
    "liquidColor" TEXT NOT NULL DEFAULT '#E8C98A',
    "capColor" TEXT NOT NULL DEFAULT '#1A1A1A',
    "model3dUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fragrance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FragranceNote" (
    "fragranceId" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "level" "NoteLevel" NOT NULL,

    CONSTRAINT "FragranceNote_pkey" PRIMARY KEY ("fragranceId","noteId","level")
);

-- CreateTable
CREATE TABLE "Accord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "Accord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FragranceAccord" (
    "fragranceId" TEXT NOT NULL,
    "accordId" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FragranceAccord_pkey" PRIMARY KEY ("fragranceId","accordId")
);

-- CreateTable
CREATE TABLE "Dupe" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "dupeId" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "country" TEXT,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLink" (
    "id" TEXT NOT NULL,
    "fragranceId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "sizeMl" INTEGER NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DupeRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dupeId" TEXT NOT NULL,
    "similarity" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "longevity" INTEGER NOT NULL,
    "sillage" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DupeRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Fragrance_slug_key" ON "Fragrance"("slug");

-- CreateIndex
CREATE INDEX "Fragrance_brandId_idx" ON "Fragrance"("brandId");

-- CreateIndex
CREATE INDEX "Fragrance_gender_idx" ON "Fragrance"("gender");

-- CreateIndex
CREATE UNIQUE INDEX "Note_name_key" ON "Note"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Note_slug_key" ON "Note"("slug");

-- CreateIndex
CREATE INDEX "FragranceNote_noteId_idx" ON "FragranceNote"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "Accord_name_key" ON "Accord"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Accord_slug_key" ON "Accord"("slug");

-- CreateIndex
CREATE INDEX "FragranceAccord_accordId_idx" ON "FragranceAccord"("accordId");

-- CreateIndex
CREATE INDEX "Dupe_dupeId_idx" ON "Dupe"("dupeId");

-- CreateIndex
CREATE UNIQUE INDEX "Dupe_originalId_dupeId_key" ON "Dupe"("originalId", "dupeId");

-- CreateIndex
CREATE UNIQUE INDEX "Retailer_name_key" ON "Retailer"("name");

-- CreateIndex
CREATE INDEX "PurchaseLink_fragranceId_idx" ON "PurchaseLink"("fragranceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DupeRating_userId_dupeId_key" ON "DupeRating"("userId", "dupeId");

-- AddForeignKey
ALTER TABLE "Fragrance" ADD CONSTRAINT "Fragrance_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FragranceNote" ADD CONSTRAINT "FragranceNote_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FragranceNote" ADD CONSTRAINT "FragranceNote_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FragranceAccord" ADD CONSTRAINT "FragranceAccord_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FragranceAccord" ADD CONSTRAINT "FragranceAccord_accordId_fkey" FOREIGN KEY ("accordId") REFERENCES "Accord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dupe" ADD CONSTRAINT "Dupe_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dupe" ADD CONSTRAINT "Dupe_dupeId_fkey" FOREIGN KEY ("dupeId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLink" ADD CONSTRAINT "PurchaseLink_fragranceId_fkey" FOREIGN KEY ("fragranceId") REFERENCES "Fragrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLink" ADD CONSTRAINT "PurchaseLink_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DupeRating" ADD CONSTRAINT "DupeRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DupeRating" ADD CONSTRAINT "DupeRating_dupeId_fkey" FOREIGN KEY ("dupeId") REFERENCES "Dupe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
