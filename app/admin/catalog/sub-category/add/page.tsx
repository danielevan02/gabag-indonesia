import { getAllCategories } from "@/lib/actions/category.action";
import SubCategoryForm from "./components/sub-category-form";
import { getAllProducts } from "@/lib/actions/product.action";

export default async function AddSubCategoryPage() {
  const categories = await getAllCategories()
  const products = await getAllProducts()

  const categoryList = categories.map((category) => ({
    name: category.name,
    id: category.id
  }))

  const productList = products.filter((product) => !product.subCategoryId).map((product) => ({
    name: product.name,
    id: product.id
  }))

  return(
    <div className="form-page">
      <p className="text-lg">Add New Sub Category</p>

      <SubCategoryForm category={categoryList} products={productList}/>
    </div>
  )
}