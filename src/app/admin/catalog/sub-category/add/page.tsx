import SubCategoryForm from "./components/sub-category-form";
import { trpc } from "@/trpc/server";

export default async function AddSubCategoryPage() {
  const [categories, products] = await Promise.all([
    trpc.category.getSelect(),
    trpc.product.getSelect()
  ])

  return(
    <div className="form-page">
      <p className="text-lg">Add New Sub Category</p>

      <SubCategoryForm categories={categories} products={products}/>
    </div>
  )
}