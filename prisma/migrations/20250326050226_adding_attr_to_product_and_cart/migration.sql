-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "weight" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "height" DECIMAL(12,2),
ADD COLUMN     "length" DECIMAL(12,2),
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "weight" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "width" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "sku" TEXT;
