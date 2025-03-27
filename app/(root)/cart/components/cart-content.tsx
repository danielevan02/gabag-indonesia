"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { updateCartItem } from "@/lib/actions/cart.action";
import { Cart, Courier, User } from "@/types";
import { Loader } from "lucide-react";
import { useCallback, useState, useTransition } from "react";
import CartTable from "./cart-table";
import SelectCourier from "./select-courier";
import { useRouter } from "next/navigation";
import AddressForm from "@/components/address-form";

interface CartContentProps {
  cart: Cart;
  couriers: Courier[];
  user?: User;
}

const CartContent: React.FC<CartContentProps> = ({ cart, couriers, user }) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [tab, setTab] = useState<"cart" | "courier" | "address">("cart");

  const handleQuantity = useCallback(
    async (productId: string, variantId?: string, action?: "increase" | "decrease") => {
      startTransition(async () => {
        await updateCartItem(productId, variantId, action);
      });
    },
    []
  );

  const handleTab = (action: "prev" | "next") => {
    const steps = ["cart", "address", "courier"] as const;
    if (!user) {
      return router.push("/sign-in");
    }

    if (!user) return router.push("/sign-in");

    const currentIndex = steps.indexOf(tab);
    if (currentIndex === -1) return;

    const newIndex = action === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < steps.length) {
      setTab(steps[newIndex]);
    }
  };

  return (
    <div className={`
        flex 
        flex-col 
        lg:flex-row 
        justify-center 
        lg:gap-10 
        lg:max-h-[500px] 
        lg:min-h-[500px]
        `}
    >
      <Tabs value={tab}>
        <TabsContent value="cart" className="max-h-full">
          <CartTable cart={cart} handleQuantity={handleQuantity} />
        </TabsContent>

        <TabsContent value="address" className="md:flex md:justify-center">
          <AddressForm user={user} />
        </TabsContent>

        <TabsContent value="courier" className="flex pt-20">
          <SelectCourier couriers={couriers} />
        </TabsContent>
      </Tabs>

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

          <div className="flex w-full justify-between">
            <p>Total Weight</p>
            <p>{cart.weight} kg(s)</p>
          </div>

          <hr className="mt-3" />
          <div className="flex w-full justify-between">
            <p className="font-bold">Total</p>
            <p className="font-semibold">Rp {cart.totalPrice.toLocaleString()}</p>
          </div>
          <hr />
        </div>

        <Button
          disabled={isLoading || cart.items.length < 0}
          className="rounded-full py-8 uppercase tracking-widest mt-10 mb-2"
          onClick={() => handleTab("next")}
        >
          {isLoading ? (
            <Loader className="animate-spin" />
          ) : tab === "courier" ? (
            "Proceed to Payment"
          ) : tab === "address" ? (
            "Next"
          ) : (
            "Checkout"
          )}
        </Button>
        {tab !== "cart" && (
          <Button
            variant="outline"
            className="py-8 rounded-full uppercase tracking-widest"
            onClick={() => handleTab("prev")}
          >
            Back
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartContent;
