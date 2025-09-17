import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { deleteManyProducts, getAllProducts } from "@/lib/actions/product.action";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminProductPage() {
  const products = await getAllProducts();
  
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Product List</h1>
        <Button>
          <Link href='/admin/catalog/product/add'>Add Product</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <DataTable
          columns={columns}
          data={products}
          deleteManyFn={deleteManyProducts}
          searchPlaceholder="Search Products"
        />
      </div>
    </div>
  );
} 