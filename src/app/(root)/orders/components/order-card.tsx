"use client"

import { useState } from "react"
import { ChevronDown, Calendar, DollarSign, Truck, ArrowRight, Package } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { OrderItemsList } from "./order-items-list"
import { StatusBadge } from "@/components/shared/status-badge"
import { ShippingStatusBadge } from "@/components/shared/shipping-status-badge"
import { format } from "date-fns"
import type { RouterOutputs } from "@/trpc/routers/_app"

type Order = RouterOutputs["order"]["getAll"][number]

interface OrderCardProps {
  order: Order
  userId: string
}

export function OrderCard({ order, userId }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const orderDate = format(order.createdAt, "EEEE, d MMMM yyyy")

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/30 transition-all duration-200 p-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3 className="font-semibold text-foreground text-base">{order.id}</h3>
              {order.trackingOrder && (
                <ShippingStatusBadge
                  status={null}
                  shippingInfo={order.shippingInfo as any}
                  showIcon={true}
                />
              )}
              <StatusBadge status={order.paymentStatus || ""} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground">{orderDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-medium text-foreground">Rp{order.totalPrice.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Waybill</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {order.trackingOrder || <span className="italic text-muted-foreground text-xs">Not Shipped</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Items</p>
                  <p className="text-sm font-medium text-foreground">{order.orderItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 mt-1 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border px-5 py-5 bg-muted/20">
          <OrderItemsList
            items={order.orderItems}
            orderId={order.id}
            userId={userId}
            isDelivered={order.isDelivered}
            isPaid={["capture", "settlement"].includes(order.paymentStatus || "")}
            shippingInfo={order.shippingInfo as any}
          />

          <div className="mt-6 pt-5 border-t border-border">
            <Link href={`/orders/${order.id}`}>
              <Button className="w-full bg-transparent" variant="outline">
                {order.paymentStatus !== "pending" ? "See Full Order Details" : "Pay Now"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}
