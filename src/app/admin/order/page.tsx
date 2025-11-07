"use client";

import { trpc } from "@/trpc/client";
import OrderDataTableWrapper from "./order-data-table-wrapper";
import { ExportOrdersDialog } from "./export-orders-dialog";
import { Loader } from "lucide-react";

export default function OrderPage() {
  const { data: orders, isLoading } = trpc.order.getAll.useQuery({});

  if (isLoading) {
    return (
      <div className="form-page">
        <div className="flex justify-center items-center flex-1">
          <Loader className="animate-spin h-6 w-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Order List</h1>
        <ExportOrdersDialog />
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <OrderDataTableWrapper orders={orders || []}/>
      </div>
    </div>
  )
}