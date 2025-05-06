/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { updateCartItem } from "@/lib/actions/cart.action";
import { createOrder } from "@/lib/actions/order.action";
import { useCartStore } from "@/lib/stores/cart-store";
import { Cart } from "@/types";
import { ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useTransition } from "react";
import { toast } from "sonner";

const CartModal = ({ cart, userId }: { cart?: Cart; userId?: string }) => {
  const router = useRouter();
  const path = usePathname();
  const { setItems, isOpen, setOpenModal } = useCartStore();
  const [isLoading, startTransition] = useTransition();

  const handleCheckout = async () => {
    if (!userId) {
      return toast.error("There is no userId! Please login or create account!");
    }
    startTransition(async () => {
      if (cart?.orderId) {
        router.push(`/orders/${cart.orderId}`);
      } else {
        const orderId = await createOrder();
        router.push(`/orders/${orderId}`);
      }
    });
  };

  const handleQuantity = useCallback(
    async (productId: string, variantId?: string, action?: "increase" | "decrease") => {
      startTransition(async () => {
        await updateCartItem(productId, variantId, action);
      });
    },
    []
  );

  useEffect(() => {
    setItems(cart?.items || []);
  }, []);

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
          {cart?.items.length}
        </div>
        <ShoppingBag />
      </SheetTrigger>
      <SheetContent className="bg-background/80 backdrop-blur-lg w-full px-5 pb-5">
        <SheetHeader className="px-0 h-[10%]">
          <SheetTitle className="flex-1 flex items-center">Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col justify-between h-[90%] gap-5 overflow-scroll">
          <ul className="flex flex-col w-full flex-1 overflow-scroll px-1">
            {cart?.items.map((item, index) => {
              const itemName = item.name.split(" - ");
              const name = itemName[0];
              const variant = itemName[1];
              return (
                <li key={index} className="flex flex-col w-full gap-3 mb-5">
                  <div className="flex w-full gap-2">
                    <div className="relative w-[20%]">
                      <div className="w-full aspect-square rounded-lg overflow-clip border">
                        <Image
                          src={item.image}
                          width={100}
                          height={100}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button className="absolute top-0 -left-1 w-5 aspect-square bg-foreground rounded-full p-1 hover:scale-110 cursor-pointer transition">
                        <X className="h-full w-full text-white dark:text-black" />
                      </button>
                    </div>

                    <Link href={`/products/${item.slug}`} className="flex flex-col w-[45%]">
                      <p className="font-medium text-sm line-clamp-1">{name}</p>
                      {variant && (
                        <p className="font-medium text-xs text-foreground/50">Variant: {variant}</p>
                      )}
                      <p className="font-medium text-neutral-600 dark:text-neutral-400 text-sm">
                        Rp {item.price.toLocaleString()}
                      </p>
                    </Link>

                    <div className="w-[35%] flex flex-col justify-between items-center">
                      <p className="font-medium text-sm">
                        Rp {(item.price * item.qty).toLocaleString()}
                      </p>

                      <div className="border border-foreground/40 rounded-full flex w-full items-center h-10">
                        <Button
                          variant="ghost"
                          className="p-1 w-[40%] rounded-full"
                          disabled={isLoading}
                          onClick={() => handleQuantity(item.productId, item.variantId, "decrease")}
                        >
                          -
                        </Button>
                        <p className="flex-1 flex justify-center items-center">{item.qty}</p>
                        <Button
                          variant="ghost"
                          className="p-1 w-[40%] rounded-full"
                          disabled={isLoading}
                          onClick={() => handleQuantity(item.productId, item.variantId, "increase")}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  {cart.items.length !== index + 1 && (
                    <hr className="w-full bg-foreground/20 h-[2px]" />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-10 justify-end h-[40%] md:h-[30%] lg:h-[45%] xl:h-[30%]">
            <div className="flex flex-col gap-4">
              {priceDetail.map((detail, index) => (
                <div className="flex flex-col" key={index}>
                  <div className="w-full flex justify-between">
                    <p className="text-sm text-foreground/60 font-medium">{detail.title}</p>
                    {detail.value === "0" ? (
                      <p className="font-medium text-sm text-foreground/60">
                        Calculated at checkout
                      </p>
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

            <Button className="rounded-full py-6 uppercase text-xs" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartModal;
