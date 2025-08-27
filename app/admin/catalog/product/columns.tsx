"use client";

import ActionTable from "@/components/shared/table/action-table";
import { deleteProduct } from "@/lib/actions/product.action";
import { Checkbox } from "@/components/ui/checkbox";
import { Product, SubCategory, Variant } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";

export type FullProduct = Product & {
  subCategory: SubCategory | null;
  variants: Variant[]
};

export const columns: ColumnDef<FullProduct>[] = [
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
          src={row.original.images[0]||'/images/placeholder.png'}
          alt={row.original.name}
          width={400}
          height={250}
          className="w-full h-full object-cover"
        />
      </div>
    )
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <p className="">Rp{row.original.regularPrice.toLocaleString("id-ID")}</p>
    )
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <p className="">{row.original.discount}%</p>
  },
  {
    header: "Sub Category",
    cell: ({ row }) => <p className="">{row.original.subCategory?.name || "None"}</p>
  },
  {
    header: "Variants",
    cell: ({ row }) => <p className="">{row.original.variants.length}</p>
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
        type="product"
        deleteFunction={deleteProduct}
        id={row.original.id} 
        title="Delete Product" 
        desc="Are you sure you want to delete this product? This action cannot be undone" 
      />
    )
  },
]; 