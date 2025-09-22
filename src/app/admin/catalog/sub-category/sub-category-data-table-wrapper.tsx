"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";
import { RouterOutputs } from "@/trpc/routers/_app";

type SubCategory = RouterOutputs['subCategory']['getAll'][number];

interface SubCategoryDataTableWrapperProps {
  subCategories: SubCategory[];
}

export default function SubCategoryDataTableWrapper({ subCategories }: SubCategoryDataTableWrapperProps) {
  const deleteManySubCategoryMutation = useDeleteManyMutation({
    type: "subCategory"
  });

  return (
    <DataTable
      columns={columns}
      data={subCategories}
      deleteManyMutation={deleteManySubCategoryMutation}
      searchPlaceholder="Search Sub Categories"
      deleteTitle="Delete Sub Categories"
    />
  );
}