/*
  Warnings:

  - You are about to drop the `_VoucherCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VoucherProducts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VoucherSubCategories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_VoucherVariants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_VoucherCategories" DROP CONSTRAINT "_VoucherCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherCategories" DROP CONSTRAINT "_VoucherCategories_B_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherProducts" DROP CONSTRAINT "_VoucherProducts_A_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherProducts" DROP CONSTRAINT "_VoucherProducts_B_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherSubCategories" DROP CONSTRAINT "_VoucherSubCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherSubCategories" DROP CONSTRAINT "_VoucherSubCategories_B_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherVariants" DROP CONSTRAINT "_VoucherVariants_A_fkey";

-- DropForeignKey
ALTER TABLE "_VoucherVariants" DROP CONSTRAINT "_VoucherVariants_B_fkey";

-- DropTable
DROP TABLE "_VoucherCategories";

-- DropTable
DROP TABLE "_VoucherProducts";

-- DropTable
DROP TABLE "_VoucherSubCategories";

-- DropTable
DROP TABLE "_VoucherVariants";

-- CreateTable
CREATE TABLE "_OrderToVoucher" (
    "A" TEXT NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_OrderToVoucher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_OrderToVoucher_B_index" ON "_OrderToVoucher"("B");

-- AddForeignKey
ALTER TABLE "_OrderToVoucher" ADD CONSTRAINT "_OrderToVoucher_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToVoucher" ADD CONSTRAINT "_OrderToVoucher_B_fkey" FOREIGN KEY ("B") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
