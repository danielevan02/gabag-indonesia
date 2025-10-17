import { auth } from "@/auth";
import { StatusBadge } from "@/components/shared/status-badge";
import { ShippingStatusBadge } from "@/components/shared/shipping-status-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/trpc/server";
import { format } from "date-fns";
import Link from "next/link";

const OrderTable = async () => {
  const session = await auth();
  const orders = await trpc.order.getAll({ userId: session?.user?.id });

  return (
    <Table className="relative">
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead>No.</TableHead>
          <TableHead>Order Id</TableHead>
          <TableHead>Items Quantity</TableHead>
          <TableHead>Total Price</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Paid At</TableHead>
          <TableHead>Waybill Number</TableHead>
          <TableHead>Delivery Status</TableHead>
          <TableHead>Order Date</TableHead>
          <TableHead className="text-end">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length !== 0 ? (
          orders.map((order, index) => {
            const orderDate = format(order.createdAt, "EEEE, d MMMM yyyy");
            return (
              <TableRow key={order.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="truncate max-w-32">{order.id}</TableCell>
                <TableCell>{order.orderItems.length} Item(s)</TableCell>
                <TableCell>Rp{order.totalPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={order.paymentStatus || ""} />
                </TableCell>
                <TableCell>
                  {order.paidAt ? format(order.paidAt, "dd/MM/yyyy HH:mm:ss") : "Not Paid"}
                </TableCell>
                <TableCell>
                  {order.trackingOrder ? (
                    order.trackingOrder
                  ) : (
                    <p className="italic text-muted-foreground">Not Shipped</p>
                  )}
                </TableCell>
                <TableCell>
                  {order.trackingOrder ? (
                    <ShippingStatusBadge
                      status={null}
                      shippingInfo={order.shippingInfo as any}
                      showIcon={true}
                    />
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-500">
                      Not Shipped
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{orderDate}</TableCell>
                <TableCell className="text-end">
                  <Link prefetch href={`/orders/${order.id}`} className="underline">
                    {order.paymentStatus !== "pending" ? "See Details" : "Pay Now"}
                  </Link>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-8 italic text-muted-foreground">
              There is no transaction.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export const OrderTableFallback = () => {
  return (
    <Table className="relative">
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          <TableHead>No.</TableHead>
          <TableHead>Order Id</TableHead>
          <TableHead>Items Quantity</TableHead>
          <TableHead>Total Price</TableHead>
          <TableHead>Payment Status</TableHead>
          <TableHead>Paid At</TableHead>
          <TableHead>Waybill Number</TableHead>
          <TableHead>Delivery Status</TableHead>
          <TableHead>Order Date</TableHead>
          <TableHead className="text-end">Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton className="h-4 w-8" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
            <TableCell className="text-end"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrderTable;
