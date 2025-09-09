import { getAllSubCategories } from "@/lib/actions/subCategory.action";
import ProductForm from "./components/product-form";

export default async function AddProductPage() {
  const subCategories = await getAllSubCategories();

  const subCategoryList = subCategories.map((subCategory) => ({
    label: subCategory.name,
    value: subCategory.id
  }));

  return (
    <div className="form-page">
      <p className="text-lg">Add New Product</p>

      <ProductForm subCategories={subCategoryList} />
    </div>
  );
} 