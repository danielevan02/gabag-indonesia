"use client"

import { ReviewButton } from "./review-button"
import Image from "next/image"
import type { RouterOutputs } from "@/trpc/routers/_app"

type OrderItem = RouterOutputs["order"]["getAll"][number]["orderItems"][number]

interface OrderItemsListProps {
  items: OrderItem[]
  orderId: string
  userId: string
  isDelivered: boolean
  isPaid: boolean
  shippingInfo?: any
}

export function OrderItemsList({ items, orderId, isDelivered, isPaid, shippingInfo }: OrderItemsListProps) {
  return (
    <div>
      <div className="mb-4">
        <h4 className="font-semibold text-foreground">Order Items</h4>
        <p className="text-sm text-muted-foreground">Review your purchased items below</p>
      </div>
      <div className="flex flex-col gap-1 max-h-56 overflow-y-scroll">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Qty: {item.qty} × Rp{Number(item.price).toLocaleString()}
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  Rp{(Number(item.price) * item.qty).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ReviewButton
                orderId={orderId}
                productId={item.productId}
                productName={item.name}
                productImage={item.image}
                isDelivered={isDelivered}
                isPaid={isPaid}
                shippingInfo={shippingInfo}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
