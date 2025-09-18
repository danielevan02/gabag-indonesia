import { Button } from "@/components/ui/button";
import { deleteCartItem, updateCartItem } from "@/lib/actions/cart.action";
import { type CartItem } from "@/types";
import { debounce } from "lodash";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TransitionStartFunction, useRef, useState } from "react";
import { toast } from "sonner";

interface CartItemProps {
  item: CartItem;
  index: number
  startTransition: TransitionStartFunction
  cartItemsLength: number
}

const CartItem = ({ item, cartItemsLength, index, startTransition }: CartItemProps) => {
  const [qty, setQty] = useState(item.qty)
  const [maxQty, setMaxQty] = useState(0)
  const itemName = item.name.split(" - ");
  const name = itemName[0];
  const variant = itemName[1];

  const debouncedUpdate = useRef(
    debounce((productId: string, finalQty: number, variantId?: string) => {
      startTransition(async() => {
        const res = await updateCartItem(productId, finalQty, variantId);

        if(!res.success){
          const resMessage = (res.message as string).split("-")
          const message = resMessage[0]
          const quantity = parseInt(resMessage[1])
          setMaxQty(quantity)
          setQty(quantity)
          toast.error(message)
        }
      })
    }, 500)
  ).current;

  const handleDeleteQty = async () => {
    await deleteCartItem(item.productId, item.variantId)
  }

  const handleQuantity = async (
    productId: string,
    variantId?: string,
    action?: "increase" | "decrease"
  ) => {
    const nextQty = action === "increase" ? qty + 1 : qty - 1;
    setQty(nextQty)
    
    debouncedUpdate(productId, nextQty, variantId)
    
  };

  return (
    <li className="flex flex-col w-full gap-3 mb-5">
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
          <button className="absolute top-0 -left-1 w-5 aspect-square bg-foreground rounded-full p-1 hover:scale-110 cursor-pointer transition" onClick={handleDeleteQty}>
            <X className="h-full w-full text-white dark:text-black" />
          </button>
        </div>

        <Link href={`/products/${item.slug}`} className="flex flex-col w-[45%]">
          <p className="font-medium text-sm line-clamp-1">{name}</p>
          {variant && <p className="font-medium text-xs text-foreground/50">Variant: {variant}</p>}
          <p className="font-medium text-neutral-600 dark:text-neutral-400 text-sm mt-1">
            Rp {item.price.toLocaleString()}
          </p>
        </Link>

        <div className="w-[35%] flex flex-col justify-between items-center">
          <p className="font-medium text-sm">Rp {(item.price * item.qty).toLocaleString()}</p>

          <div className="border border-foreground/40 rounded-full flex w-full items-center h-10">
            <Button
              variant="ghost"
              className="p-1 w-[40%] rounded-full"
              disabled={qty===0}
              onClick={() => handleQuantity(item.productId, item.variantId, "decrease")}
            >
              -
            </Button>
            <p className="flex-1 flex justify-center items-center">{qty}</p>
            <Button
              variant="ghost"
              className="p-1 w-[40%] rounded-full"
              disabled={qty === maxQty}
              onClick={() => handleQuantity(item.productId, item.variantId, "increase")}
            >
              +
            </Button>
          </div>
        </div>
      </div>

      {cartItemsLength !== index + 1 && <hr className="w-full bg-foreground/20 h-[2px]" />}
    </li>
  );
};

export default CartItem;