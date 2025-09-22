"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Image from "next/image";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";

export type Product = RouterOutputs['product']['getAll'][number]

const ProductActionCell = ({ productId }: { productId: string }) => {
  const deleteProductMutation = useDeleteMutation({ type: "product" });

  return (
    <ActionTable
      type="product"
      deleteMutation={deleteProductMutation}
      id={productId}
      title="Delete Product"
      desc="Are you sure you want to delete this product? This action cannot be undone"
    />
  );
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
        aria-label="select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="select row"
      />
    ),
  },
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="line-clamp-1 capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-56 h-32 rounded-lg overflow-clip border">
        <Image
          src={row.original.images[0].mediaFile.secure_url || "/images/placeholder.png"}
          alt={row.original.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
  {
    accessorKey: 'stock',
    header: "Stock"
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = Number(row.original);
      return price !== 0 ? (
        <p className="">Rp{row.original.regularPrice.toLocaleString("id-ID")}</p>
      ) : (
        <p className="text-foreground/50">No Price</p>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <p className="">{row.original.discount}%</p>,
  },
  {
    header: "Sub Category",
    cell: ({ row }) => <p className="">{row.original.subCategory.name|| "None"}</p>,
  },
  {
    header: "Variants",
    cell: ({ row }) => {
      const variantLength = row.original.variants.length;
      return variantLength !== 0 ? <p>{variantLength}</p> : <p className="text-foreground/50">No Variants</p>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "dd/MM/yyyy")}</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ProductActionCell productId={row.original.id} />,
  },
];
