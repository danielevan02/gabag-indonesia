"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Category } from "@/generated/prisma";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";

const CategoryActionCell = ({ categoryId }: { categoryId: string }) => {
  const deleteCategoryMutation = useDeleteMutation({ type: "category" });

  return (
    <ActionTable
      type="category"
      deleteMutation={deleteCategoryMutation}
      id={categoryId}
      title="Delete Category"
      desc="Are you sure you want to delete this category? This action cannot be undone"
    />
  );
};

export const columns: ColumnDef<Category>[] = [
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
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-56 h-32 rounded-lg overflow-clip border">
        <Image
          src={row.getValue('image')}
          alt={row.original.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "EEEE, d MMMM yyyy")}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => <CategoryActionCell categoryId={row.original.id} />
  },
];
