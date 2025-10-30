-- CreateTable
CREATE TABLE "VoucherBatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prefix" TEXT NOT NULL,
    "totalCodes" INTEGER NOT NULL,
    "generatedCount" INTEGER NOT NULL DEFAULT 0,
    "templateValue" INTEGER NOT NULL,
    "templateType" "VoucherType" NOT NULL,
    "templateApplicationType" "VoucherApplicationType" NOT NULL,
    "templateMinPurchase" BIGINT,
    "templateMaxDiscount" BIGINT,
    "templateMaxShippingDiscount" BIGINT,
    "templateStartDate" TIMESTAMP(6) NOT NULL,
    "templateExpires" TIMESTAMP(6) NOT NULL,
    "templateCanCombine" BOOLEAN NOT NULL DEFAULT false,
    "categoryId" UUID,
    "subCategoryId" UUID,
    "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "variantIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generatedCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoucherBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoucherBatch_prefix_idx" ON "VoucherBatch"("prefix");
