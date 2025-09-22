import EditProductForm from "./components/edit-product-form";
import { trpc } from "@/trpc/server";

type tParams = Promise<{ productId: string }>;

export default async function EditProductPage({ params }: { params: tParams }) {
  const { productId }: { productId: string } = await params;

  const data = await trpc.product.getByIdWithSubCategories({ id: productId });

  if (!data) {
    return (
      <div className="p-5 flex flex-col h-full">
        <p className="text-lg text-red-500">Product not found</p>
      </div>
    );
  }

  // Convert images to array if it's a string
  const productImages = Array.isArray(data.images) ? data.images : data.images ? [data.images] : [];

  return (
    <div className="form-page">
      <p className="text-lg">Edit Product</p>

      <EditProductForm
        data={{
          ...data,
          images: productImages,
        }}
      />
    </div>
  );
}
