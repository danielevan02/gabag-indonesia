"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "../columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type Product = RouterOutputs['product']['getAll']['products'][number];

interface ProductDataTableWrapperProps {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export default function ProductDataTableWrapper({
  products,
  totalCount,
  currentPage,
  totalPages,
  pageSize
}: ProductDataTableWrapperProps) {

  return (
    <DataTable
      columns={columns}
      data={products}
      searchPlaceholder="Search Products"
      deleteTitle="Delete Product"
      totalCount={totalCount}
      currentPage={currentPage}
      totalPages={totalPages}
      pageSize={pageSize}
    />
  );
}