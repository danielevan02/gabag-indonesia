import { Suspense } from "react";
import OrderList, { OrderListFallback } from "./components/order-list";

const OrderPage = () => {
  return (
    <div className="w-full max-w-screen min-h-screen bg-background">
      <h1 className="text-xl md:text-3xl w-full text-center font-semibold mt-5">Order List</h1>
      <p className="text-muted-foreground w-full text-center">Track and manage your purchase</p>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <Suspense fallback={<OrderListFallback />}>
          <OrderList />
        </Suspense>
      </div>
    </div>
  );
};

export default OrderPage;
