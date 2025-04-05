import { Button } from "@/components/ui/button";

import { getMyCart } from "@/lib/actions/cart.action";

import { Metadata } from "next";
import CartContent from "./components/cart-content";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.action";

export const metadata: Metadata = {
  title: 'Cart',
}

const CartPage = async () => {
  const cart = await getMyCart()
  const session = await auth()
  const user = await getUserById(session?.user?.id)

  if(!cart){
    return (
      <div className="w-full max-w-screen px-5">
        <div className="flex flex-col mx-auto w-fit items-center gap-5 h-96 justify-center">
          <h1 className="text-4xl tracking-widest text-center">There is no product added.</h1>
          <Button asChild className="rounded-full text-2xl px-5 py-8 uppercase font-light tracking-widest">
            <Link href='/products'>Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  } 

  return (
    <div className="w-full max-w-screen px-5 mt-10">
      <CartContent 
        userId={user?.id}
        cart={{
          ...cart,
          userId: session?.user?.id as string, 
          itemsPrice: BigInt(cart.itemsPrice), 
          taxPrice: BigInt(cart.taxPrice),
          totalPrice: BigInt(cart.totalPrice),
        }}/>

    </div>
  );
}
 
export default CartPage;