"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types";
import { X } from "lucide-react";

interface OrderSummaryProps {
  cartItems: CartItem[];
  itemsPrice: number;
  taxPrice: number;
  shippingPrice?: number;
  totalPrice: number;
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: (code: string) => void;
  onRemoveVoucher: (code: string) => void;
  appliedVouchers: Array<{
    code: string;
    discount: number;
    shippingDiscount: number;
    totalDiscount: number;
    canCombine?: boolean;
  }>;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  itemsPrice,
  taxPrice,
  shippingPrice,
  totalPrice,
  voucherCode,
  onVoucherCodeChange,
  onApplyVoucher,
  onRemoveVoucher,
  appliedVouchers,
}) => {
  const totalProductDiscount = appliedVouchers.reduce((sum, v) => sum + v.discount, 0);
  const totalShippingDiscount = appliedVouchers.reduce((sum, v) => sum + v.shippingDiscount, 0);
  const hasNonCombinableVoucher = appliedVouchers.some(v => !v.canCombine);
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

      <div className="mt-10 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          {appliedVouchers.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-green-800">Applied Vouchers</p>
              {appliedVouchers.map((voucher) => (
                <div
                  key={voucher.code}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
                >
                  <div className="flex flex-col flex-1">
                    <p className="text-sm font-medium text-green-800">{voucher.code}</p>
                    <p className="text-xs text-green-600">
                      Discount: Rp {voucher.totalDiscount.toLocaleString()}
                      {voucher.canCombine && " • Stackable"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveVoucher(voucher.code)}
                    className="h-8 w-8 p-0 hover:bg-green-100"
                  >
                    <X className="h-4 w-4 text-green-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={voucherCode}
              placeholder={hasNonCombinableVoucher ? "Remove voucher to add new" : "Input your voucher here"}
              disabled={!(!!shippingPrice && shippingPrice !== 0) || hasNonCombinableVoucher}
              onChange={(e) => onVoucherCodeChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onApplyVoucher(voucherCode);
                }
              }}
            />
            <Button
              onClick={() => onApplyVoucher(voucherCode)}
              disabled={!(!!shippingPrice && shippingPrice !== 0) || hasNonCombinableVoucher}
            >
              Apply
            </Button>
          </div>
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
        {totalProductDiscount > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-green-600">Product Discount</p>
            <p className="text-sm text-green-600">- Rp {totalProductDiscount.toLocaleString()}</p>
          </div>
        )}
        {totalShippingDiscount > 0 && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-green-600">Shipping Discount</p>
            <p className="text-sm text-green-600">- Rp {totalShippingDiscount.toLocaleString()}</p>
          </div>
        )}
        <div className="flex justify-between items-center pt-3 border-t">
          <p className="text-lg font-semibold">Total</p>
          <p className="text-2xl font-semibold">Rp {totalPrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
