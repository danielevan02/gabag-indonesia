import { getCurrentUser } from "@/lib/actions/user.action";
import OrderForm from "./components/order-form";
import OrderDetails from "./components/order-details";
import { Metadata } from "next";
import { trpc } from "@/trpc/server";

type tParams = Promise<{ orderId: string }>;

// Disable static generation for orders - they should be dynamic
// Orders are user-specific and frequently changing data
// export async function generateStaticParams() {
//   const orders = await trpc.order.getAll({});
//   return orders.map((order) => ({ orderId: order.id }));
// }

export async function generateMetadata({ params }: { params: tParams }): Promise<Metadata> {
  try {
    const { orderId }: { orderId: string } = await params;
    const order = await trpc.order.getById({id: orderId});

    return {
      title: `${order.id} - ${order.paymentStatus}` || "Order Details",
    };
  } catch (error) {
    // Fallback metadata if order fetch fails
    console.error('Failed to fetch order for metadata:', error);
    return {
      title: "Order Details",
    };
  }
}

const OrderDetailPage = async ({ params }: { params: tParams }) => {
  const { orderId }: { orderId: string } = await params;
  
  const [order, user, cart] = await Promise.all([
    trpc.order.getById({id: orderId}),
    getCurrentUser(),
    trpc.cart.getMyCart()
  ])

  return (
    <div
      className={`
        relative 
        w-full 
        max-w-screen 
        flex 
        flex-col
        lg:flex-row
        px-5 
        justify-center
        `}
    >
      {(order&&order.paymentStatus&&order.shippingInfo&&order.transactionToken) ? (
        <OrderDetails order={order}/>
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
