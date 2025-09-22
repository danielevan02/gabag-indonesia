"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { RouterOutputs } from "@/trpc/routers/_app";

type SubCategory = RouterOutputs['subCategory']['getAll'][number]

const SubCategoryActionCell = ({ subCategoryId }: { subCategoryId: string }) => {
  const deleteSubCategoryMutation = useDeleteMutation({ type: "subCategory" });

  return (
    <ActionTable
      type="sub-category"
      deleteMutation={deleteSubCategoryMutation}
      id={subCategoryId}
      title="Delete Sub Category"
      desc="Are you sure you want to delete this sub-category? This action cannot be undone"
    />
  );
};

export const columns: ColumnDef<SubCategory>[] = [
  {
    id: 'select',
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomeRowsSelected() && 'indeterminate'}
        onCheckedChange={(val)=>table.toggleAllPageRowsSelected(!!val)}
        aria-label="select all"
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val)=>row.toggleSelected(!!val)}
        aria-label="select row"
      />
    )
  },
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="line-clamp-1 capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    header: "Image",
    cell: ({ row }) => (
      <div className="w-56 h-32 rounded-lg overflow-clip border">
        <Image
          src={row.original.mediaFile?.secure_url}
          alt={row.original.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
    )
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <p className="">{row.original.discount}%</p>
  },
  {
    header: "Category",
    cell: ({ row }) => <p className="">{row.original.category.name}</p>
  },
  {
    header: "Products",
    cell: ({ row }) => <p className="">{row.original._count.products}</p>
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "EEEE, d MMMM yyyy")}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => <SubCategoryActionCell subCategoryId={row.original.id}/>
  },
];