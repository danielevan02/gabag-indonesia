"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";

type Voucher = RouterOutputs['voucher']['getAll'][number]

const VoucherActionCell = ({ voucherId }: { voucherId: string }) => {
  const deleteVoucherMutation = useDeleteMutation({ type: "voucher" });

  return (
    <ActionTable
      type="voucher"
      deleteMutation={deleteVoucherMutation}
      id={voucherId}
      title="Delete Voucher"
      catalog={false}
      desc="Are you sure you want to delete this voucher? This action cannot be undone. Note: Vouchers that have been used cannot be deleted."
    />
  );
};

export const columns: ColumnDef<Voucher>[] = [
  {
    id: 'select',
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")}
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
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "applicationType",
    header: "Application Type",
  },
  {
    header: "Details",
    cell: ({ row }) => {
      const { applicationType, category, subCategory, event, products, variants } = row.original;

      if (applicationType === "ALL_PRODUCTS") {
        return <p className="text-muted-foreground">-</p>;
      }

      if (applicationType === "CATEGORY" && category) {
        return <p>{category.name}</p>;
      }

      if (applicationType === "SUBCATEGORY" && subCategory) {
        return <p>{subCategory.name}</p>;
      }

      if (applicationType === "EVENT" && event) {
        return <p>{event.name}</p>;
      }

      if (applicationType === "SPECIFIC_PRODUCTS" && products && products.length > 0) {
        return (
          <div className="max-w-[200px]">
            <p className="truncate" title={products.map(p => p.name).join(", ")}>
              {products.map(p => p.name).join(", ")}
            </p>
          </div>
        );
      }

      if (applicationType === "SPECIFIC_VARIANTS" && variants && variants.length > 0) {
        return (
          <div className="max-w-[200px]">
            <p className="truncate" title={variants.map(v => v.name).join(", ")}>
              {variants.map(v => v.name).join(", ")}
            </p>
          </div>
        );
      }

      return <p className="text-muted-foreground">-</p>;
    },
  },
  {
    header: "Used / Available",
    cell: ({ row }) => <p>{row.original.usedCount} / {row.original.totalLimit || "∞"}</p>
  },
  {
    header: "Stackable",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.canCombine ? (
          <span className="text-green-600 text-sm font-medium">✓ Yes</span>
        ) : (
          <span className="text-gray-500 text-sm">✗ No</span>
        )}
      </div>
    ),
  },
  {
    header: "Expire At",
    cell: ({ row }) => <p>{format(row.original.expires, "EEEE, d MMMM yyyy")}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => <VoucherActionCell voucherId={row.original.id} />,
  },
];