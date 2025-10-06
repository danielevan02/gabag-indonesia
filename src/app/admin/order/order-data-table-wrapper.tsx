"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

type Order = RouterOutputs['order']['getAll'][number];

interface OrderDataTableWrapperProps {
  orders: Order[];
}

export default function OrderDataTableWrapper({ orders }: OrderDataTableWrapperProps) {
  const utils = trpc.useUtils();

  const createBulkShipment = trpc.courier.createBulkShipment.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        const message = 'successCount' in data && 'errorCount' in data
          ? `${data.message}. Success: ${data.successCount}, Errors: ${data.errorCount}`
          : data.message;
        toast.success(message);
        utils.order.getAll.invalidate();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create bulk shipment");
    },
  });

  const handleBulkShipment = (orderIds: string[]) => {
    createBulkShipment.mutate({ orderIds });
  };

  return (
    <DataTable
      columns={columns}
      data={orders}
      searchPlaceholder="Search Order"
      searchColumn="id"
      bulkShipmentAction={handleBulkShipment}
      isBulkShipmentPending={createBulkShipment.isPending}
    />
  );
}