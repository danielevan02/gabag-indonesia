import { getMyCart } from "@/lib/actions/cart.action";
import { getAllOrders } from "@/lib/actions/order.action";
import { getCurrentUser } from "@/lib/actions/user.action";
import OrderForm from "./components/order-form";

export async function generateStaticParams() {
  const orders = await getAllOrders();
  return orders.map((order) => ({ orderId: order.id }));
}

type tParams = Promise<{ orderId: string }>;

const OrderDetailPage = async ({ params }: { params: tParams }) => {
  const { orderId }: { orderId: string } = await params;
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
      <OrderForm
        user={user}
        cartItem={cart?.items || []}
        itemsPrice={Number(cart?.itemsPrice)}
        taxPrice={Number(cart?.taxPrice)}
        totalPrice={Number(cart?.totalPrice)}
        orderId={orderId}
      />
    </div>
  );
};

export default OrderDetailPage;
