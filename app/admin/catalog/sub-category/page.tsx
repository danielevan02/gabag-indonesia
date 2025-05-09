import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { deleteManySubCategories, getAllSubCategories } from "@/lib/actions/subCategory.action";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminSubCategoryPage() {
  const subCategories = await getAllSubCategories();
  return (
    <div className="p-5 h-full max-h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Sub Category List</h1>
        <Button>
          <Link href='/admin/catalog/sub-category/add'>Add Sub Category</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
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
