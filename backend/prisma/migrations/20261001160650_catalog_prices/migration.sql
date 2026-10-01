-- AlterTable
ALTER TABLE "Fragrance" ADD COLUMN     "priceMax" INTEGER,
ADD COLUMN     "priceMin" INTEGER,
ALTER COLUMN "gender" DROP NOT NULL;
