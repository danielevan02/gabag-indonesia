"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";
import { RouterOutputs } from "@/trpc/routers/_app";

type Voucher = RouterOutputs['voucher']['getAll'][number];

interface VoucherDataTableWrapperProps {
  vouchers: Voucher[];
}

export default function VoucherDataTableWrapper({ vouchers }: VoucherDataTableWrapperProps) {
  const deleteManyVoucherMutation = useDeleteManyMutation({
    type: "voucher"
  });

  return (
    <DataTable
      columns={columns}
      data={vouchers}
      deleteManyMutation={deleteManyVoucherMutation}
      searchPlaceholder="Search Voucher"
      deleteTitle="Delete Voucher"
      searchColumn="code"
    />
  );
}