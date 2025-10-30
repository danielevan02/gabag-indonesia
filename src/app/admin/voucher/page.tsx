import { trpc } from "@/trpc/server";
import VoucherTabs from "./voucher-tabs";
import prisma from "@/lib/prisma";

export default async function VoucherPage() {
  const [vouchers, batches, categories, subCategories, products, variants] = await Promise.all([
    trpc.voucher.getAll(),
    trpc.voucher.getAllBatches(),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subCategory.findMany({
      select: { id: true, name: true, categoryId: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: { id: true, name: true, subCategoryId: true },
      orderBy: { name: "asc" },
    }),
    prisma.variant.findMany({
      select: { id: true, name: true, productId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="form-page">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-medium text-2xl">Voucher Management</h1>
      </div>

      <VoucherTabs
        vouchers={vouchers}
        batches={batches}
        categories={categories}
        subCategories={subCategories}
        products={products}
        variants={variants}
      />
    </div>
  );
}