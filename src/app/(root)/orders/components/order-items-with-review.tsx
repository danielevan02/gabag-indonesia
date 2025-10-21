"use client";

import { ReviewButton } from "./review-button";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  variantId?: string | null;
}

interface OrderItemsWithReviewProps {
  orderId: string;
  orderItems: OrderItem[];
  isDelivered: boolean;
  isPaid: boolean;
  userId: string;
}

export function OrderItemsWithReview({
  orderId,
  orderItems,
  isDelivered,
  isPaid,
}: OrderItemsWithReviewProps) {
  // Don't show anything if order is not delivered or not paid
  if (!isDelivered || !isPaid) {
    return <span className="text-xs text-gray-500">-</span>;
  }

  if (orderItems.length === 0) {
    return <span className="text-xs text-gray-500">-</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {orderItems.map((item: OrderItem) => (
        <ReviewButton
          key={item.id}
          orderId={orderId}
          productId={item.productId}
          productName={item.name}
          productImage={item.image}
          isDelivered={isDelivered}
          isPaid={isPaid}
        />
      ))}
    </div>
  );
}
