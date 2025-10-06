"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CreateShipmentButton from "./components/create-shipment-button";
import { ShippingInfo } from "@/types";
import { RouterOutputs } from "@/trpc/routers/_app";
import { Eye } from "lucide-react";
import Link from "next/link";

type Order = RouterOutputs['order']['getAll'][number]

const OrderActionCell = ({ orderId }: { orderId: string }) => {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={`/admin/order/${orderId}`}>
        <Eye className="size-4" />
        See Details
      </Link>
    </Button>
  );
};

export const columns: ColumnDef<Order>[] = [
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
    accessorKey: "id",
    header: "Order ID",
    cell: ({row}) => <p className="max-w-20 truncate">{row.original.id}</p>
  },
  {
    accessorKey: "courier",
    header: "Courier",
    cell: ({ row }) => <p className="uppercase">{row.original.courier}</p>,
  },
  {
    accessorKey: "paidAt",
    header: "Paid At",
    cell: ({row}) => 
      row.original.paidAt ? (
        <p>{format(row.original.paidAt, "dd/MM/yyyy, HH:mm:ss")}</p>
      ) : (
        <p className="italic text-foreground/40">Not Paid</p>
      ),
  },
  {
    accessorKey: "trackingOrder",
    header: "Tracking Order",
    cell: ({ row }) => {
      const trackingOrder = row.original.trackingOrder;
      const paymentStatus = row.original.paymentStatus;
      return trackingOrder ? (
        <p>{row.original.trackingOrder}</p>
      ) : paymentStatus === "settlement" ? (
        <CreateShipmentButton
          courier={row.original.courier!}
          shippingInfo={row.original.shippingInfo as ShippingInfo}
          orderId={row.original.id}
        />
      ) : (
        <div className="italic text-foreground/40">Shipment not available</div>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const paymentStatus = row.original.paymentStatus;
      const props =
        paymentStatus === "settlement"
          ? {
              className: "uppercase bg-green-500",
            }
          : paymentStatus === "pending"
            ? {
                variant: "default" as const,
                className: "uppercase",
              }
            : {
                variant: "destructive" as const,
                className: "uppercase",
              };
      return <Badge {...props}>{paymentStatus}</Badge>;
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => <p>Rp{Number(row.original.totalPrice).toLocaleString()}</p>,
  },
  {
    header: "Recipient's Name",
    cell: ({ row }) => <p>{row.original.user.name}</p>,
  },
  {
    accessorKey: "deliveredAt",
    header: "Delivered At",
    cell: ({ row }) =>
      row.original.deliveredAt ? (
        <p>{format(row.original.deliveredAt, "dd/MM/yyyy, HH:mm:ss")}</p>
      ) : (
        <p className="italic text-foreground/40">Not Delivered</p>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "dd/MM/yyyy, HH:mm:ss")}</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => <OrderActionCell orderId={row.original.id}/>
  },
];
