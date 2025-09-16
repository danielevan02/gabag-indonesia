import { getProductById } from "@/lib/actions/product.action";
import EditProductForm from "./components/edit-product-form";
import { getAllSubCategories } from "@/lib/actions/subCategory.action";

type tParams = Promise<{ productId: string }>;

export default async function EditProductPage({
  params,
}: {
  params: tParams;
}) {
  const { productId }: { productId: string } = await params;

  const [product, subCategories] = await Promise.all([
    getProductById(productId),
    getAllSubCategories(),
  ]);

  const subCategoryList = subCategories.map((subCategory) => ({
    value: subCategory.id,
    label: subCategory.name,
  }));

  if (!product) {
    return (
      <div className="p-5 flex flex-col h-full">
        <p className="text-lg text-red-500">Product not found</p>
      </div>
    );
  }

  // Convert images to array if it's a string
  const productImages = Array.isArray(product.images) 
    ? product.images 
    : product.images 
      ? [product.images] 
      : [];

  return (
    <div className="form-page">
      <p className="text-lg">Edit Product</p>

      <EditProductForm
        subCategoryList={subCategoryList}
        product={{
          ...product,
          subCategory: product.subCategory ? {
            label: product.subCategory.name,
            value: product.subCategory.id,
          } : null,
          image: productImages,
          price: Number(product.regularPrice),
          discount: product.discount || 0,
          description: product.description || "",
          variants: product.variants||[],
        }}
      />
    </div>
  );
} 