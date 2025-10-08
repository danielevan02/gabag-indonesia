"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type SubCategory = RouterOutputs['subCategory']['getAll'][number];

interface SubCategoryDataTableWrapperProps {
  subCategories: SubCategory[];
}

export default function SubCategoryDataTableWrapper({ subCategories }: SubCategoryDataTableWrapperProps) {

  return (
    <DataTable
      columns={columns}
      data={subCategories}
      searchPlaceholder="Search Sub Categories"
      deleteTitle="Delete Sub Categories"
    />
  );
}