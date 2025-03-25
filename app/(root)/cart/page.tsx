import { Button } from "@/components/ui/button";

import { getMyCart } from "@/lib/actions/cart.action";

import { Metadata } from "next";
import CartTable from "./components/cart-table";
import Link from "next/link";
import { auth } from "@/auth";


export const metadata: Metadata = {
  title: 'Cart',

}

const CartPage = async () => {
  const cart = await getMyCart()
  const session = await auth()

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
    <div className="w-full max-w-screen px-5">

      <h1 className="text-3xl md:text-5xl my-5 lg:my-10 w-full text-center">My Cart</h1>
      <CartTable 
        cart={{
          ...cart,
          userId: session?.user?.id as string, 
          itemsPrice: BigInt(cart.itemsPrice), 
          taxPrice: BigInt(cart.taxPrice),
          totalPrice: BigInt(cart.totalPrice)
        }}/>

    </div>
  );
}
 
export default CartPage;