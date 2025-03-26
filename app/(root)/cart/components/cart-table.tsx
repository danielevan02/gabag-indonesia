'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Cart, CartItem } from "@/types";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

const CartTable = React.memo(({ cart, handleQuantity }: {
  cart: Cart;
  handleQuantity: (
    productId: string, 
    variantId?: string, 
    action?: 'decrease' | 'increase'
  ) => void;
}) => {
  console.log("CartTable rendered");
  const cartItems = useMemo(()=>cart.items as CartItem[], [cart.items])
  return (
    <div className="flex flex-col">
      <h1 className="text-xl tracking-widest mb-5">Your Cart</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-60 lg:w-80 uppercase text-xs">Product</TableHead>
            <TableHead className="w-32 uppercase text-xs">Price</TableHead>
            <TableHead className="uppercase text-xs">Quantity</TableHead>
            <TableHead className="uppercase text-xs text-right">Total Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.length > 0 
            ? cartItems.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="flex gap-2 mr-5 items-center">
                  <Image
                    src={item.image}
                    alt={item.name}
                    height={200}
                    width={100}
                    className="object-cover"
                  />
                  <h2 className="break-words whitespace-normal">{item.name}</h2>
                </TableCell>
                <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex justify-between items-center w-28 h-10 rounded-md border px-1">
                    <Minus
                      size={15}
                      onClick={() => handleQuantity(item.productId, item.variantId, "decrease")}
                    />
                    {item.qty}
                    <Plus
                      size={15}
                      onClick={() => handleQuantity(item.productId, item.variantId, "increase")}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-lg">
                  Rp {(item.price * item.qty).toLocaleString()}
                </TableCell>
              </TableRow>
            ))
            : <TableRow>
              <TableCell colSpan={4}>
                <p className="text-center text-neutral-500 min-h-20 flex items-center justify-center">
                  There is no product, <Link href='/products' className="underline hover:text-neutral-950 ml-2">Continue Shopping</Link>
                </p>
              </TableCell>
            </TableRow>
          }
        </TableBody>
      </Table>
    </div>
  );
});

CartTable.displayName = "CartTable"

export default CartTable;
