"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { batchColumns } from "./batch-columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type Batch = RouterOutputs["voucher"]["getAllBatches"][number];

interface BatchDataTableWrapperProps {
  batches: Batch[];
}

export default function BatchDataTableWrapper({ batches }: BatchDataTableWrapperProps) {
  return (
    <DataTable
      columns={batchColumns}
      data={batches}
      searchPlaceholder="Search Batch"
      deleteTitle="Delete Batch"
      searchColumn="name"
    />
  );
}
