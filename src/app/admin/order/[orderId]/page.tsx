import { trpc } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, CreditCard, Truck, User, MapPin } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const order = await trpc.order.getById({ id: orderId });
  const shippingInfo = order.shippingInfo;

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "settlement":
      case "capture":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div className="h-full p-5 overflow-scroll flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/order">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span className="font-medium">{format(order.createdAt, "dd MMM yyyy, HH:mm")}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge className={getPaymentStatusColor(order.paymentStatus || "")}>
                {order.paymentStatus?.toUpperCase()}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid At:</span>
              <span className="font-medium">
                {order.paidAt ? format(order.paidAt, "dd MMM yyyy, HH:mm") : "Not Paid"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Status:</span>
              <Badge variant={order.isDelivered ? "default" : "secondary"}>
                {order.isDelivered ? "Delivered" : "Not Delivered"}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivered At:</span>
              <span className="font-medium">
                {order.deliveredAt ? format(order.deliveredAt, "dd MMM yyyy, HH:mm") : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{shippingInfo?.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone:</span>
              <span className="font-medium">{shippingInfo?.phone}</span>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address:
              </span>
              <span className="font-medium text-sm">{shippingInfo?.address}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Courier:</span>
              <span className="font-medium uppercase">{order.courier || "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracking Number:</span>
              <span className="font-medium">{order.trackingOrder || "-"}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Price:</span>
              <span className="font-medium">Rp{Number(order.shippingPrice).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Price:</span>
              <span className="font-medium">Rp{Number(order.itemsPrice).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping Price:</span>
              <span className="font-medium">Rp{Number(order.shippingPrice).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax:</span>
              <span className="font-medium">Rp{Number(order.taxPrice).toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <div className="flex gap-2 items-center">
                <span className="font-medium text-green-600">
                  -Rp{Number(order.discountAmount).toLocaleString()}
                </span>
                {order.voucherCodes &&
                  order.voucherCodes.length !== 0 &&
                  order.voucherCodes.map((code) => (
                    <span
                      key={code}
                      className="text-sm bg-green-200 py-1 px-2 text-green-600 rounded-md"
                    >
                      {code}
                    </span>
                  ))}
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>Rp{Number(order.totalPrice).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-scroll">
            {order.orderItems.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Quantity: {item.qty}</p>
                  <p className="text-sm text-muted-foreground">
                    Weight: {item.weight}g | Dimensions: {item.length}x{item.width}x{item.height} cm
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">Rp{Number(item.price).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Subtotal: Rp{(Number(item.price) * item.qty).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
