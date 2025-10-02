"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "../columns";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";
import { RouterOutputs } from "@/trpc/routers/_app";

type Product = RouterOutputs['product']['getAll']['products'][number];

interface ProductDataTableWrapperProps {
  products: Product[];
}

export default function ProductDataTableWrapper({ products }: ProductDataTableWrapperProps) {
  const deleteManyProductMutation = useDeleteManyMutation({
    type: "product"
  });

  return (
    <DataTable
      columns={columns}
      data={products}
      deleteManyMutation={deleteManyProductMutation}
      searchPlaceholder="Search Products"
      deleteTitle="Delete Product"
    />
  );
}