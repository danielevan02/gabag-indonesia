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
    header: "Used / Available",
    cell: ({ row }) => <p>{row.original.usedCount} / {row.original.totalLimit || "∞"}</p>
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "EEEE, d MMMM yyyy")}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => <VoucherActionCell voucherId={row.original.id} />,
  },
];