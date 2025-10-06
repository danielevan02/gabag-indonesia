import { Suspense } from "react";
import OrderTable, { OrderTableFallback } from "./components/order-table";

const OrderPage = () => {
  return (
    <div className="w-full max-w-screen">
      <div className="px-2 md:px-10 mt-5 min-h-[690px]">
        <h1 className="text-lg font-semibold text-center mb-5">Order History</h1>
        <Suspense fallback={<OrderTableFallback />}>
          <OrderTable />
        </Suspense>
      </div>
    </div>
  );
};

export default OrderPage;
