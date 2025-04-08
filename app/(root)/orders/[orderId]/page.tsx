import { getMyCart } from "@/lib/actions/cart.action";
import { getAllOrders, getOrderById } from "@/lib/actions/order.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import OrderForm from "./components/order-form";
import OrderDetails from "./components/order-details";
import { FullOrderType } from "@/types";

export async function generateStaticParams() {
  const orders = await getAllOrders();
  return orders.map((order) => ({ orderId: order.id }));
}

type tParams = Promise<{ orderId: string }>;

const OrderDetailPage = async ({ params }: { params: tParams }) => {
  const { orderId }: { orderId: string } = await params;
  const order = await getOrderById(orderId)
  const user = await getCurrentUser();
  const cart = await getMyCart();

  return (
    <div
      className={`
        relative 
        w-full 
        max-w-screen 
        flex 
        flex-col-reverse
        lg:flex-row
        px-5 
        justify-center
        `}
    >
      {(order&&order.paymentStatus&&order.shippingInfo&&order.transactionToken) ? (
        <OrderDetails order={{...order as FullOrderType}}/>
      ):(
        <OrderForm
          user={user}
          cartItem={cart?.items || []}
          itemsPrice={Number(cart?.itemsPrice)}
          taxPrice={Number(cart?.taxPrice)}
          totalPrice={Number(cart?.totalPrice)}
          orderId={orderId}
        />
      )}
    </div>
  );
};

export default OrderDetailPage;
