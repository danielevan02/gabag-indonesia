import ProductForm from "./components/product-form";
import { trpc } from "@/trpc/server";

export default async function AddProductPage() {
  const subCategories = await trpc.subCategory.getSelect();

  return (
    <div className="form-page">
      <p className="text-lg">Add New Product</p>

      <ProductForm subCategories={subCategories} />
    </div>
  );
} 