import { Button } from "@/components/ui/button";

import { getMyCart } from "@/lib/actions/cart.action";

import { Metadata } from "next";
import CartContent from "./components/cart-content";
import Link from "next/link";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.action";
import { getProductByCategory } from "@/lib/actions/product.action";
import ProductCard from "@/components/shared/product/product-card";

export const metadata: Metadata = {
  title: "Cart",
};

const CartPage = async () => {
  const cart = await getMyCart();
  const session = await auth();
  const user = await getUserById(session?.user?.id);
  const products = await getProductByCategory("Cooler Bag");

  if (!cart) {
    return (
      <div className="w-full max-w-screen px-5">
        <div className="flex flex-col mx-auto w-fit items-center gap-5 h-96 justify-center">
          <h1 className="text-4xl tracking-widest text-center">There is no product added.</h1>
          <Button
            asChild
            className="rounded-full text-2xl px-5 py-8 uppercase font-light tracking-widest"
          >
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
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
        }}
      />

      {products && (
        <div className="mt-10">
          <p className="text-2xl">You Might Also Like</p>
          <div className="flex gap-1 mt-5 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory py-px">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                {...product}
                categoryName={product.categories[0].name}
                image={product.images[0]}
                category={product.categories}
                banner={product.banner!}
                className={`
                min-w-56 
                max-w-56 
                md:min-w-80 
                md:max-w-80 
                lg:min-w-96
                lg:max-w-96
                snap-start
              `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
