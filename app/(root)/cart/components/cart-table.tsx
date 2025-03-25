"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateCartItem } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { Cart } from "@prisma/client";
import { Loader, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";

const CartTable = ({ cart }: { cart: Cart }) => {
  const [isLoading, startTransition] = useTransition();

  const handleQuantity = async (
    productId: string,
    variantId?: string,
    action?: "increase" | "decrease"
  ) => {
    startTransition(async () => {
      await updateCartItem(productId, variantId, action);
    });
  };
  return (
    <div className="flex flex-col lg:flex-row justify-center gap-10">
      <div className="flex flex-col">
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
            {cart.items.length > 0 
              ?(cart.items as CartItem[]).map((item, i) => (
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
                  <p className="text-center text-neutral-500 min-h-20 flex items-center justify-center">There is no product, <Link href='/products' className="underline hover:text-neutral-950 ml-2">Continue Shopping</Link></p>
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col min-w-72">
        <h4 className="text-xl mb-5">Summary</h4>
        <div className="flex flex-col gap-2">
          <div className="flex w-full justify-between">
            <p>Subtotal</p>
            <p>Rp {cart.itemsPrice.toLocaleString()}</p>
          </div>

          <div className="flex w-full justify-between">
            <p>Tax Price</p>
            <p>Rp {cart.taxPrice.toLocaleString()}</p>
          </div>

          <hr className="mt-3" />
          <div className="flex w-full justify-between">
            <p className="font-bold">Total</p>
            <p className="font-semibold">Rp {cart.totalPrice.toLocaleString()}</p>
          </div>
          <hr />
        </div>

        <Button disabled={isLoading} className="rounded-full py-8 uppercase tracking-widest mt-10">
          {isLoading ? <Loader className="animate-spin"/> : "Checkout"}
        </Button>
      </div>
    </div>
  );
};

export default CartTable;
