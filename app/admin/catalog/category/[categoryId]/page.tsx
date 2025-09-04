import { getCategoryById } from "@/lib/actions/category.action";
import EditCategoryForm from "./components/edit-category-form";

type tParams = Promise<{ categoryId: string }>;

export default async function EditCategoryPage({ params }: { params: tParams }) {
  const { categoryId }: { categoryId: string } = await params;

  const category = await getCategoryById(categoryId);

  return category ? (
    <div className="p-5 flex flex-col h-full">
      <p className="text-lg">Edit Category</p>
      <EditCategoryForm category={category} />
    </div>
  ) : (
    <div className="p-5 flex items-center justify-center h-full">There is no Category</div>
  );
}
