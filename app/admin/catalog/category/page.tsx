import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { deleteManyCategories, getAllCategories } from "@/lib/actions/category.action";

export default async function AdminCategoryPage() {
  const categories = await getAllCategories()
    
  return (
    <div className="p-5 h-full max-h-full flex flex-col">
      <h1 className="font-medium text-2xl">Category List</h1>
      <div className='flex-1 overflow-hidden flex flex-col h-full'>
        <DataTable columns={columns} data={categories} deleteManyFn={deleteManyCategories} searchPlaceholder="Search Categories" />
      </div>
    </div>
  )
}