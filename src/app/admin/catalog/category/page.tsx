import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { trpc } from "@/trpc/server";

export default async function AdminCategoryPage() {
  const categories = await trpc.category.getAll();

  return (
    <div className="form-page">
      <h1 className="font-medium text-2xl">Category List</h1>
      <div className='flex-1 overflow-hidden flex flex-col h-full'>
        <DataTable
          columns={columns}
          data={categories || []}
          searchPlaceholder="Search Categories"
        />
      </div>
    </div>
  )
}