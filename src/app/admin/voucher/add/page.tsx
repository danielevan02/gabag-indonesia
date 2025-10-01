import VoucherForm from "./components/voucher-form";
import prisma from "@/lib/prisma";

export default async function AddVoucherPage() {
  // Fetch dropdown options
  const [categories, subCategories, events, products, variants] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.subCategory.findMany({
      select: { id: true, name: true, categoryId: true },
      orderBy: { name: "asc" },
    }),
    prisma.event.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { hasVariant: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.variant.findMany({
      select: { id: true, name: true, productId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-5 h-full max-h-screen flex flex-col overflow-hidden">
      <p className="text-lg">Add New Voucher</p>
      <VoucherForm
        categories={categories}
        subCategories={subCategories}
        events={events}
        products={products}
        variants={variants}
      />
    </div>
  );
}