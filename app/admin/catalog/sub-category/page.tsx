import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { deleteManySubCategories, getAllSubCategories } from "@/lib/actions/subCategory.action";

export default async function AdminSubCategoryPage() {
  const subCategories = await getAllSubCategories();
  return (
    <div className="p-5 h-full">
      <h1 className="font-medium text-2xl">Sub Category List</h1>
      <div className='flex-1 overflow-hidden flex flex-col h-full'>
        <DataTable
          columns={columns}
          data={subCategories}
          deleteManyFn={deleteManySubCategories}
          searchPlaceholder="Search Categories"
        />
      </div>
    </div>
  );
}
