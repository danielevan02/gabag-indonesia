"use client";

import ActionTable from "@/components/shared/table/action-table";
import { deleteSubCategory } from "@/lib/actions/subCategory.action";
import { Checkbox } from "@/components/ui/checkbox";
import { Category, SubCategory } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";

type FullSubCategory = SubCategory & {
  category: Category
  _count: {
    products: number
  }
}

export const columns: ColumnDef<FullSubCategory>[] = [
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
    cell: ({ row }) => (
      <ActionTable 
        type="sub-category"
        deleteFunction={deleteSubCategory}
        id={row.original.id} 
        title="Delete Product" 
        desc="Are you sure you want to delete this product? this action cannot be undone" 
      />
    )
  },
];