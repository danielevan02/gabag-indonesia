import EditSubCategoryForm from "./components/edit-sub-category-form";
import { trpc } from "@/trpc/server";

type tParams = Promise<{ subCategoryId: string }>;

export default async function EditSubCategoryPage({
  params,
}: {
  params: tParams;
}) {
  const { subCategoryId }: { subCategoryId: string } = await params;

  const [subCategory, categories] = await Promise.all([
    trpc.subCategory.getById({id: subCategoryId}),
    trpc.category.getSelect(),
  ]);

  if (!subCategory) {
    return (
      <div className="p-5 flex flex-col h-full">
        <p className="text-lg text-red-500">Sub Category not found</p>
      </div>
    );
  }

  return (
    <div className="form-page">
      <p className="text-lg">Edit Sub Category</p>

      <EditSubCategoryForm
        categoryList={categories}
        subCategory={subCategory}
      />
    </div>
  );
}
