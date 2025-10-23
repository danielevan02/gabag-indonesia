"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";

export type Product = RouterOutputs['product']['getAll']['products'][number]

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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="text-wrap capitalize max-w-40">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-56 h-32 rounded-lg overflow-clip border">
        <Image
          src={row.original.images || "/images/placeholder.png"}
          alt={row.original.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
    ),
  },
  {
    header: "Stock",
    cell: ({row}) => {
      const productStock = row.original.stock
      const variantStock = row.original.variants.reduce((prev, curr) => curr.stock+prev ,0)
      
      if(variantStock !== 0) {
        return <p>{variantStock} item(s)</p>
      } else if(productStock !== 0) {
        return <p>{productStock} item(s)</p>
      } else {
        return <p className="text-destructive italic text-sm">Empty Stock!</p>
      }
    }
  },
  {
    header: "Regular Price",
    cell: ({ row }) => {
      const price = Number(row.original.regularPrice);
      return price !== 0 ? (
        <p>Rp{price.toLocaleString("id-ID")}</p>
      ) : (
        <p className="text-foreground/50">No Price</p>
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <p>{row.original.discount}%</p>,
  },
  {
    header: "Price",

    cell: ({row}) => {
      const price = Number(row.original.price);
      return price !== 0 ? (
        <p>Rp{price.toLocaleString("id-ID")}</p>
      ) : (
        <p className="text-foreground/50">No Price</p>
      );
    }
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
    id: "actions",
    cell: ({ row }) => <ProductActionCell productId={row.original.id} />,
  },
];
