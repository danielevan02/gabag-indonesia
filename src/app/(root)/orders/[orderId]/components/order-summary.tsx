"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types";
import { useState } from "react";

interface OrderSummaryProps {
  cartItems: CartItem[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice?: number;
  totalPrice: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  itemsPrice,
  taxPrice,
  shippingPrice,
  totalPrice,
}) => {
  const [voucher, setVoucher] = useState("");
  const handleVoucher = () => {};
  return (
    <div className="block lg:sticky top-36 right-0 overflow-hidden flex-1 lg:max-w-lg p-5 h-fit">
      <h2 className="font-semibold text-lg mb-5">Your Cart</h2>
      <div className="flex flex-col gap-3 max-h-72 overflow-scroll pt-1">
        {cartItems.map((item, index) => (
          <div className="flex gap-2 justify-between" key={index}>
            {/* IMAGE CONTAINER */}
            <div className="w-16 h-16 rounded-md relative border">
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

            <div className="flex flex-col max-w-72 justify-between flex-1">
              <h2 className="text-xs md:text-sm mb-auto line-clamp-2">{item.name}</h2>
              <p className="text-xs">Rp {item.price.toLocaleString()}</p>
            </div>

            <p className="text-sm font-medium">Rp {(item.price * item.qty).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Input
            value={voucher}
            placeholder="Input your voucher here"
            disabled={!(!!shippingPrice && shippingPrice !== 0)}
            onChange={(e) => setVoucher(e.target.value)}
          />
          <Button
            onClick={handleVoucher}
            className=""
            disabled={!(!!shippingPrice && shippingPrice !== 0)}
          >
            Apply Voucher
          </Button>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Subtotal</p>
          <p className="text-sm">Rp {itemsPrice.toLocaleString()}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Tax Price</p>
          <p className="text-sm">Rp {taxPrice.toLocaleString()}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm">Shipping</p>
          {shippingPrice && shippingPrice !== 0 ? (
            <p className="text-sm">Rp {shippingPrice.toLocaleString()}</p>
          ) : (
            <p className="text-xs text-neutral-500">Enter shipping address</p>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Total</p>
          <p className="text-2xl font-semibold">Rp {totalPrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
