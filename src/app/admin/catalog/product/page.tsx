import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/server";
import ProductDataTableWrapper from "./components/product-data-table-wrapper";

type SearchParams = Promise<{
  page?: string;
  limit?: string;
  search?: string;
}>;

export default async function AdminProductPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "15");
  const search = params.search || "";

  const productData = await trpc.product.getAll({ limit, page, search });

  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Product List</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Link href='/admin/catalog/product/sync-stock'>Sync Stock</Link>
          </Button>
          <Button>
            <Link href='/admin/catalog/product/add'>Add Product</Link>
          </Button>
        </div>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <ProductDataTableWrapper
          products={productData.products}
          totalCount={productData.totalCount}
          currentPage={page}
          totalPages={productData.totalPages}
          pageSize={limit}
          searchValue={search}
        />
      </div>
    </div>
  );
} 