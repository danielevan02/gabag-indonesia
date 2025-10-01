import { auth } from "@/auth";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
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

const OrderPage = async () => {
  const session = await auth();
  const orders = await trpc.order.getAll({ userId: session?.user?.id });
  return (
    <div className="w-full max-w-screen">
      <div className="px-2 md:px-10 mt-5 min-h-[690px]">
        <h1 className="text-lg font-semibold text-center mb-5">Order History</h1>
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
                      {order.trackingOrder ? order.trackingOrder : <p className="italic text-muted-foreground">Not Delivered</p>}
                    </TableCell>
                    <TableCell>
                      <Badge>{order.isDelivered ? "delivered" : "not delivered"}</Badge>
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
                <TableCell colSpan={9} className="text-center py-8 italic text-muted-foreground">
                  There is no transaction.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderPage;
