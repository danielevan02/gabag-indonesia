import { getSubCategoryById } from "@/lib/actions/subCategory.action";
import EditSubCategoryForm from "./components/edit-sub-category-form";

type tParams = Promise<{ subCategoryId: string }>;

export default async function EditSubCategoryPage({params}:{params: tParams}) {
  const { subCategoryId }: {subCategoryId: string} = await params;
  const subCategory = await getSubCategoryById(subCategoryId)

  if (!subCategory) {
    return (
      <div className="p-5 flex flex-col h-full">
        <p className="text-lg text-red-500">Sub Category not found</p>
      </div>
    )
  }
  
  return(
    <div className="p-5 flex flex-col h-full">
      <p className="text-lg">Edit Sub Category</p>

      <EditSubCategoryForm 
        subCategory={{
          id: subCategory.id,
          name: subCategory.name,
          category: {
            label: subCategory.category.name,
            value: subCategory.category.id
          },
          image: subCategory.image || "",
          discount: subCategory.discount || 0,
          products: subCategory.products.map(product => ({
            label: product.name,
            value: product.id
          }))
        }}
      />
    </div>
  )
}