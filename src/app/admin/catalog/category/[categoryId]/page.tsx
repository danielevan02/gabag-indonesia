import EditCategoryForm from "./components/edit-category-form";
import { trpc } from "@/trpc/server";

type tParams = Promise<{ categoryId: string }>;

export default async function EditCategoryPage({ params }: { params: tParams }) {
  const { categoryId }: { categoryId: string } = await params;

  const category = await trpc.category.getById({id: categoryId});

  return category ? (
    <div className="form-page">
      <p className="text-lg">Edit Category</p>
      <EditCategoryForm category={category}/>
    </div>
  ) : (
    <div className="p-5 flex items-center justify-center h-full">There is no Category</div>
  );
}
