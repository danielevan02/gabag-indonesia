"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";
import { RouterOutputs } from "@/trpc/routers/_app";

type Order = RouterOutputs['order']['getAll'][number];

interface OrderDataTableWrapperProps {
  orders: Order[];
}

export default function OrderDataTableWrapper({ orders }: OrderDataTableWrapperProps) {
  const deleteManyEventMutation = useDeleteManyMutation({
    type: "order"
  });

  return (
    <DataTable
      columns={columns}
      data={orders}
      deleteManyMutation={deleteManyEventMutation}
      searchPlaceholder="Search Order"
      deleteTitle="Delete Order"
      searchColumn="id"
    />
  );
}