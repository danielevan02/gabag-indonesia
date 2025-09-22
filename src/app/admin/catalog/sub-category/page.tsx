import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/server";
import SubCategoryDataTableWrapper from "./sub-category-data-table-wrapper";

export default async function AdminSubCategoryPage() {
  const subCategories = await trpc.subCategory.getAll();
  
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Sub Category List</h1>
        <Button>
          <Link href='/admin/catalog/sub-category/add'>Add Sub Category</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <SubCategoryDataTableWrapper subCategories={subCategories} />
      </div>
    </div>
  );
}
