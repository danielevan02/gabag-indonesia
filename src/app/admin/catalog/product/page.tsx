import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/server";
import ProductDataTableWrapper from "./components/product-data-table-wrapper";

export default async function AdminProductPage() {
  const { products } = await trpc.product.getAll({});

  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Product List</h1>
        <Button>
          <Link href='/admin/catalog/product/add'>Add Product</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <ProductDataTableWrapper products={products} />
      </div>
    </div>
  );
} 