import { getMyCart } from "@/lib/actions/cart.action";
import { getAllOrders, getOrderById } from "@/lib/actions/order.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import OrderForm from "./components/order-form";
import OrderDetails from "./components/order-details";
import { FullOrderType } from "@/types";
import { Metadata } from "next";

type tParams = Promise<{ orderId: string }>;

export async function generateStaticParams() {
  const orders = await getAllOrders();
  return orders.map((order) => ({ orderId: order.id }));
}

export async function generateMetadata({ params }: { params: tParams }): Promise<Metadata> {
  const { orderId }: { orderId: string } = await params;
  const order = await getOrderById(orderId);

  return {
    title: `${order.id} - ${order.paymentStatus}` || "Product Details",
  };
}

const OrderDetailPage = async ({ params }: { params: tParams }) => {
  const { orderId }: { orderId: string } = await params;
  
  const [order, user, cart] = await Promise.all([
    getOrderById(orderId),
    getCurrentUser(),
    getMyCart()
  ])

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
