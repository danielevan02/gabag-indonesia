"use client";

import { Button } from "@/components/ui/button";
import { updateCartItem } from "@/lib/actions/cart.action";
import { CartItem } from "@/types";
import { Loader, Minus, Plus } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createOrder } from "@/lib/actions/order.action";
import { Cart } from "@prisma/client";
import { toast } from "sonner";

interface CartContentProps {
  cart: Cart;
  userId?: string;
}

const CartContent: React.FC<CartContentProps> = ({ cart, userId }) => {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isLoading, startTransition] = useTransition();

  const handleQuantity = useCallback(
    async (productId: string, variantId?: string, action?: "increase" | "decrease") => {
      startTransition(async () => {
        await updateCartItem(productId, variantId, action);
      });
    },
    []
  );

  const handleCheckout = async () => {
    if (!userId) {
      return toast.error("There is no userId! Please login or create account!");
    }
    startTransition(async () => {
      if (cart.orderId) {
        router.push(`/orders/${cart.orderId}`);
      } else {
        const orderId = await createOrder(notes);
        router.push(`/orders/${orderId}`);
      }
    })
  };

  return (
    <div
      className={`
        flex 
        flex-col 
        lg:flex-row 
        justify-center 
        lg:gap-10 
        lg:max-h-[500px] 
        lg:min-h-[500px]
        `}
    >
      <div className="flex flex-col lg:max-h-full md:max-h-96 max-h-80 overflow-scroll">
        <h1 className="text-xl tracking-widest mb-3">Your Cart</h1>
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="min-w-60 lg:w-80 uppercase text-xs">Product</TableHead>
              <TableHead className="w-32 uppercase text-xs">Price</TableHead>
              <TableHead className="uppercase text-xs">Quantity</TableHead>
              <TableHead className="uppercase text-xs text-right">Total Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="max-h-16 lg:max-h-24 overflow-scroll">
            {cart.items.length > 0 ? (
              (cart.items as CartItem[]).map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="flex gap-2 mr-5 items-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      height={200}
                      width={100}
                      className="object-cover min-h-28 max-h-28 min-w-28 max-w-28"
                    />
                    <h2 className="break-words whitespace-normal">{item.name}</h2>
                  </TableCell>
                  <TableCell>Rp {item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex justify-between items-center w-28 h-10 rounded-md border">
                      <Button
                        onClick={() => handleQuantity(item.productId, item.variantId, "decrease")}
                        variant="ghost"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader className="animate-spin" /> : <Minus size={15} />}
                      </Button>
                      {item.qty}
                      <Button
                        onClick={() => handleQuantity(item.productId, item.variantId, "increase")}
                        variant="ghost"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader className="animate-spin" /> : <Plus size={15} />}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-lg">
                    Rp {(item.price * item.qty).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <p className="text-center text-neutral-500 min-h-20 flex items-center justify-center">
                    There is no product,{" "}
                    <Link href="/products" className="underline hover:text-neutral-950 ml-2">
                      Continue Shopping
                    </Link>
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* SUMMARY SECTION */}
      <div className="flex flex-col lg:max-w-72 md:w-full mt-10 lg:mt-0">
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

          <p className="text-xs text-neutral-600">Shipping price calculated at checkout.</p>

          <hr className="mt-3" />
          <div className="flex w-full justify-between">
            <p className="font-bold">Total</p>
            <p className="font-semibold">Rp {cart.totalPrice.toLocaleString()}</p>
          </div>
          <hr />

          <div className="flex flex-col gap-2 mt-3 text-xs">
            <Label>Order notes</Label>
            <Input
              placeholder="enter your order notes (optional)"
              type="text"
              onBlur={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <Button
          disabled={isLoading || cart.items.length < 0}
          className="rounded-full py-8 uppercase tracking-widest mt-5 mb-2"
          onClick={handleCheckout}
        >
          {isLoading ? <Loader className="animate-spin" /> : "checkout"}
        </Button>
      </div>
    </div>
  );
};

export default CartContent;
