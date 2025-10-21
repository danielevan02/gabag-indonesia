import { auth } from "@/auth";
import { trpc } from "@/trpc/server";
import { OrderCard } from "./order-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

const OrderList = async () => {
  const session = await auth();
  const orders = await trpc.order.getAll({ userId: session?.user?.id });

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <Card className="p-8">
          <p className="text-muted-foreground italic">There is no transaction.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} userId={session?.user?.id || ""} />
      ))}
    </div>
  );
};

export const OrderListFallback = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <Card key={index} className="overflow-hidden border border-border">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div className="min-w-0">
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div className="min-w-0">
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div className="min-w-0">
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <div className="min-w-0">
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
              </div>
              <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrderList;
