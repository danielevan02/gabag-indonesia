"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type Voucher = RouterOutputs['voucher']['getAll'][number];

interface VoucherDataTableWrapperProps {
  vouchers: Voucher[];
}

export default function VoucherDataTableWrapper({ vouchers }: VoucherDataTableWrapperProps) {

  return (
    <DataTable
      columns={columns}
      data={vouchers}
      searchPlaceholder="Search Voucher"
      deleteTitle="Delete Voucher"
      searchColumn="code"
    />
  );
}