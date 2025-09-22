"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { trpc } from "@/trpc/client";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";

export default function AdminCategoryPage() {
  const { data: categories, isLoading } = trpc.category.getAll.useQuery();
  const deleteManyMutation = useDeleteManyMutation({ type: "category" });

  if (isLoading) {
    return (
      <div className="form-page">
        <h1 className="font-medium text-2xl">Category List</h1>
        <div className="flex-1 flex items-center justify-center">
          <div>Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <h1 className="font-medium text-2xl">Category List</h1>
      <div className='flex-1 overflow-hidden flex flex-col h-full'>
        <DataTable
          columns={columns}
          data={categories || []}
          deleteManyMutation={deleteManyMutation}
          searchPlaceholder="Search Categories"
          deleteTitle="Delete Categories"
        />
      </div>
    </div>
  )
}