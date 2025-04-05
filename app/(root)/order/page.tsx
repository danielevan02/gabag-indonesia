import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllOrders } from "@/lib/actions/order.action";
import { format } from "date-fns"

const OrderPage = async () => {
  const session = await auth()
  const orders = await getAllOrders(session?.user?.id)
  return (
    <div className="w-full max-w-screen">
      <div className="px-10 mt-10 min-h-[690px]">
        <Table className="relative  ">
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Order Id</TableHead>
              <TableHead>Items Quantity</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Paid At</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-end">Order Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order, index) => {
              const orderDate = format(order.createdAt, "EEEE, d MMMM yyyy")
              return(
                <TableRow key={order.id}>
                  <TableCell>{index+1}</TableCell>
                  <TableCell className="truncate max-w-32">{order.id}</TableCell>
                  <TableCell>{order.orderItems.length} Item(s)</TableCell>
                  <TableCell>Rp{order.totalPrice.toLocaleString()}</TableCell>
                  <TableCell> <Badge color="green">{order.paymentStatus}</Badge></TableCell>
                  <TableCell>{order.paidAt ? format(order.paidAt, "dd/MM/yyyy HH:mm:ss"):"Not Paid"}</TableCell>
                  <TableCell> <Badge>{order.isDelivered ? "delivered" : "not delivered"}</Badge></TableCell>
                  <TableCell className="text-end">{orderDate}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
 
export default OrderPage;