"use client";

import Image from "next/image";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShippingInfo } from "@/types";
import { format } from "date-fns";
import Script from "next/script";
import { toast } from "sonner";
import { RouterOutputs } from "@/trpc/routers/_app";

declare global {
  interface Window {
    snap: any;
  }
}

const OrderDetails = ({ order }: { order: RouterOutputs['order']['getById'] }) => {
  const shippingInfo = order.shippingInfo as ShippingInfo;
  const subtotal = order.orderItems?.reduce(
    (prev, curr) => prev + Number(curr.price) * curr.qty,
    0
  );

  const handlePayment = async () => {
    if (!order.transactionToken) {
      return toast.error("Payment Error: There is no token");
    }

    window.snap.pay(order.transactionToken);
  };

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_UI}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="flex-1 p-5 overflow-hidden lg:max-w-xl flex flex-col gap-12 lg:border-r-1">
        <div>
          <h1 className="text-xl font-semibold mb-5">Order Info</h1>
          <div className="grid grid-cols-3 gap-y-5">
            <p className="col-span-1 text-sm">Email</p>
            <p className="col-span-2 text-sm text-end">{shippingInfo.email}</p>
            <p className="col-span-1 text-sm">Name</p>
            <p className="col-span-2 text-sm text-end">{shippingInfo.name}</p>
            <p className="col-span-1 text-sm">Address</p>
            <p className="col-span-2 text-sm text-end">{shippingInfo.address}</p>
            <p className="col-span-1 text-sm">Phone</p>
            <p className="col-span-2 text-sm text-end">{shippingInfo.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-12 gap-x-10 md:gap-x-0">
          <div className="col-span-1">
            <h3 className="mb-3 font-semibold">Courier</h3>
            <p className="uppercase">{order.courier}</p>
          </div>
          <div className="col-span-1">
            <h3 className="mb-3 font-semibold">Payment Status</h3>
            <StatusBadge status={order.paymentStatus || ""} />
          </div>
          <div className="col-span-1">
            <h3 className="mb-3 font-semibold">Order Created</h3>
            <p className="text-sm">{format(order.createdAt!, "EEEE, d MMMM yyyy")}</p>
          </div>
          <div className="col-span-1">
            <h3 className="mb-3 font-semibold">Order Notes</h3>
            <Textarea disabled className="text-sm" value={order.notes || "There is no notes"} />
          </div>
          <div className="col-span-1">
            <h3 className="mb-3 font-semibold">Delivery Status</h3>
            <p className="text-sm">{order.isDelivered ? "On Delivery" : "Not Delivered"}</p>
          </div>
          <div className="col-span-1">
            <h3 className="mb-3 font-semibold">Paid At</h3>
            <p className="text-sm">
              {order.isPaid && order.paidAt
                ? format(order.paidAt, "dd/MM/yyyy HH:mm:ss")
                : "Not Paid"}
            </p>
          </div>
        </div>

        {order.isPaid ? (
          <div className="relative my-7 flex flex-col justify-center">
            <div className="bg-gradient-to-r from-transparent via-foreground to-transparent h-px" />
            <p className="uppercase tracking-widest absolute px-1 w-fit text-sm left-1/2 -translate-x-1/2 bg-background">
              Order Paid
            </p>
          </div>
        ) : ["cancel", "deny", "expire"].includes(order.paymentStatus!) ? (
          <div className="relative my-7 flex flex-col justify-center">
            <div className="bg-gradient-to-r from-transparent via-foreground to-transparent h-px" />
            <p className="uppercase tracking-widest absolute px-1 w-fit text-sm left-1/2 -translate-x-1/2 bg-background text-red-600 text-center">
              your order is cancelled
            </p>
          </div>
        ) : (
          <Button
            className="rounded-full uppercase tracking-widest text-xs py-7"
            onClick={handlePayment}
          >
            Make a payment
          </Button>
        )}
      </div>
      <div className="block lg:sticky top-36 right-0 overflow-hidden flex-1 lg:max-w-lg p-5 h-fit">

        <h2 className="font-semibold text-lg mb-5">Your Order</h2>

        <div className="flex flex-col gap-3 max-h-72 overflow-scroll pt-1">
          {order.orderItems?.map((item, index) => (
            <div className="flex gap-2 justify-between" key={index}>
              {/* IMAGE CONTAINER */}
              <div className="w-16 h-16 rounded-md relative">
                <Image
                  src={item.image}
                  alt={item.name}
                  height={100}
                  width={100}
                  className="h-full w-full object-cover rounded-md"
                />
                <p className="absolute -top-1 -right-1 bg-neutral-500 px-1 rounded-full text-white text-xs">
                  {item.qty}
                </p>
              </div>

              <div className="flex flex-col max-w-72 justify-between flex-1 py-2">
                <h2 className="text-sm mb-auto font-semibold">{item.name}</h2>
                <p className="text-xs ">Rp {Number(item.price).toLocaleString()}</p>
              </div>

              <p className="text-sm">
                Rp {(Number(item.price) * Number(item.qty)).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5">
          <div className="flex justify-between">
            <p className="text-sm">Subtotal</p>
            <p className="text-sm">Rp {subtotal?.toLocaleString()}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm">Tax Price</p>
            <p className="text-sm">Rp {Number(order.taxPrice).toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm">Shipping</p>
            <p className="text-sm">Rp {Number(order.shippingPrice).toLocaleString()}</p>
          </div>
          {order.voucherCodes && order.voucherCodes.length > 0 && (
            <div className="flex flex-col gap-2 py-3 border-y">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-green-700">Voucher Applied</p>
                <p className="text-xs text-green-600">
                  {order.voucherCodes.map((code, index) => (
                    <>
                      <span key={code}>{code}</span>
                      {order.voucherCodes.length-1 !== index &&(
                        <span>, </span>
                      )}
                    </>
                  ))}
                </p>
              </div>
              {order.discountAmount && Number(order.discountAmount) > 0 && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-green-600">Discount</p>
                  <p className="text-sm text-green-600 font-medium">
                    - Rp {Number(order.discountAmount).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-between items-center pt-3">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-xl md:text-2xl font-semibold">
              Rp {Number(order.totalPrice).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
