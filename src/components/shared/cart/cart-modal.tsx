/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/stores/cart.store";
import { Loader, ShoppingBag, ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import { toast } from "sonner";
import CartItem from "./cart-item";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CartModalProps {
  userId?: string;
}

const CartModal = ({ userId }: CartModalProps) => {
  const router = useRouter();
  const path = usePathname();
  const [isLoading, startTransition] = useTransition();
  const { setItems, isOpen, setOpenModal } = useCartStore();
  const [notes, setNotes] = useState("");

  // Use tRPC query to get cart data
  const { data: cart, isLoading: cartLoading } = trpc.cart.getMyCart.useQuery();
  const { mutateAsync: createOrder } = trpc.order.create.useMutation({
    onSuccess: (res) => {
      router.push(`/orders/${res.orderId}`);
    },
  });

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      return toast.error("There is no cart items");
    }
    if (!userId) {
      router.push("/sign-in");
      return toast.error("Please login or create account!");
    }
    startTransition(async () => {
      if (cart?.orderId) {
        router.push(`/orders/${cart.orderId}`);
      } else {
        await createOrder({ notes });
      }
    });
  };

  useEffect(() => {
    setItems(cart?.items || []);
  }, [cart?.items]);

  useEffect(() => {
    setOpenModal(false);
  }, [path]);

  const priceDetail = [
    { title: "Price", value: cart?.itemsPrice },
    { title: "Taxes", value: cart?.taxPrice },
    { title: "Shipping", value: cart?.shippingPrice },
    { title: "Total", value: cart?.totalPrice },
  ];
  return (
    <Sheet open={isOpen} onOpenChange={setOpenModal}>
      <SheetTrigger className="relative w-10 h-10 flex items-center justify-center transition-all hover:bg-accent rounded-lg">
        <div className="absolute bg-red-700 rounded-full text-white min-w-4 h-4 px-1 text-center text-xs -top-0.5 -right-px">
          {cart?.items.length ?? 0}
        </div>
        <ShoppingBag />
      </SheetTrigger>
      <SheetContent className="bg-background/80 backdrop-blur-lg w-full px-5 pb-5 gap-0">
        <SheetHeader className="px-0 h-[10%]">
          <SheetTitle className="flex-1 flex items-center">Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col justify-between h-[90%] gap-5 overflow-scroll">
          <ul className="flex flex-col w-full flex-1 overflow-scroll px-1">
            {cartLoading ? (
              <div className="flex justify-center items-center h-20">
                <Loader className="animate-spin" />
              </div>
            ) : cart?.items.length !== 0 && cart ? (
              cart?.items.map((item, index) => {
                return (
                  <CartItem
                    key={index}
                    startTransition={startTransition}
                    item={item}
                    index={index}
                    cartItemsLength={cart.items.length}
                  />
                );
              })
            ) : (
              <div className="flex justify-center flex-col items-center gap-2">
                <ShoppingCart />
                <p className="font-medium text-lg">There is no item</p>
              </div>
            )}
          </ul>

          <div className="flex flex-col justify-end">
            <div className="flex flex-col gap-2 mb-2">
              <Label>Notes (optional)</Label>
              <div className="flex flex-col items-end gap-1">
                <Textarea
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-black resize-none"
                  placeholder="e.g: Please be carefull"
                  maxLength={150}
                />
                <p className="text-xs">{notes.length}/150</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-5">
              {priceDetail.map((detail, index) => (
                <div className="flex flex-col" key={index}>
                  <div className="w-full flex justify-between">
                    <p className="text-sm text-foreground/60 font-medium">{detail.title}</p>
                    {detail.title === "Shipping" ? (
                      <p className="font-medium text-sm text-foreground/60">
                        Calculated at checkout
                      </p>
                    ) : isLoading || cartLoading ? (
                      <Skeleton className="w-28 h-5 mb-1" />
                    ) : (
                      <p className="font-medium">
                        Rp {parseInt(detail.value || "0").toLocaleString()}
                      </p>
                    )}
                  </div>
                  {priceDetail.length !== index && (
                    <hr className="w-full bg-foreground/10 h-[2px]" />
                  )}
                </div>
              ))}
            </div>

            <Button
              className="rounded-full py-6 uppercase text-xs"
              onClick={handleCheckout}
              disabled={isLoading || cartLoading || cart?.items.length === 0}
            >
              {isLoading || cartLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartModal;
