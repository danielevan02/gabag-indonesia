"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "../columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type Product = RouterOutputs['product']['getAll']['products'][number];

interface ProductDataTableWrapperProps {
  products: Product[];
}

export default function ProductDataTableWrapper({ products }: ProductDataTableWrapperProps) {

  return (
    <DataTable
      columns={columns}
      data={products}
      searchPlaceholder="Search Products"
      deleteTitle="Delete Product"
    />
  );
}