"use client";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { updateCartItem } from "@/lib/actions/cart.action";
import { Cart, Courier } from "@/types";
import { Loader, Check, ChevronsUpDown } from "lucide-react";
import { useSession } from 'next-auth/react'

import { useCallback, useState, useTransition } from "react";
import CartTable from "./cart-table";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const CartContent = ({ cart, couriers }: { cart: Cart; couriers: Courier[]}) => {
  const router = useRouter()
  const session = useSession()
  const [isLoading, startTransition] = useTransition();
  const [tab, setTab] = useState("cart")
  const [open, setOpen] = useState(false)
  const [selectedCourier, setSelectedCourier] = useState("")

  const handleQuantity = useCallback(
    async (productId: string, variantId?: string, action?: "increase" | "decrease") => {
      startTransition(async () => {
        await updateCartItem(productId, variantId, action);
      });
    },
    []
  );

  const handleTab = () => {
    if(!session.data?.user?.id){
      router.push('/sign-in')
    }
    setTab("courier")
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-10">
      <Tabs value={tab}>

        <TabsContent value="cart">
          <CartTable cart={cart} handleQuantity={handleQuantity} />
        </TabsContent>

        <TabsContent value="courier">
          <div className="flex flex-col gap-3 md:w-3xl h-96 items-center justify-center lg:-translate-y-20">
            <p>Choose a courier for your delivery</p>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[300px] md:w-[400px] justify-between"
                >
                  {selectedCourier
                    ? couriers.find((courier) => `${courier.courier_code}-${courier.courier_service_code}` === selectedCourier)?.courier_name+"-"+couriers.find((courier) => `${courier.courier_code}-${courier.courier_service_code}` === selectedCourier)?.courier_service_name
                    : "Select courier..."}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] md:w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search courier..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No Courier found.</CommandEmpty>
                    <CommandGroup>
                      {couriers.map((courier, index) => (
                        <CommandItem
                          key={index}
                          value={courier.courier_code+"-"+courier.courier_service_code}
                          onSelect={(currentValue) => {
                            setSelectedCourier(currentValue === selectedCourier ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          {courier.courier_name}-{courier.courier_service_name}
                          <Check
                            className={cn(
                              "ml-auto",
                              selectedCourier === `${courier.courier_code}-${courier.courier_service_code}` ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </TabsContent>

      </Tabs>



      {/* SUMMARY SECTION */}
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

        <Button disabled={isLoading || cart.items.length < 0} className="rounded-full py-8 uppercase tracking-widest mt-10" onClick={handleTab}>
          {isLoading ? <Loader className="animate-spin"/> : tab === 'courier' ? "Proceed to Payment" : tab === "address" ? "Next": "Checkout"}
        </Button>
      </div>
    </div>
  );
};

export default CartContent;
