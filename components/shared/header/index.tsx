import React from "react";
import NavLinks from "./nav-links";
import { ModeToggle } from "./mode-toggle";
import Logo from "./logo";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import SearchBar from "./search-bar";
import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileDrawer from "./mobile-drawer";
import { SessionProvider } from "next-auth/react";

const Header = async () => {
  const session = await auth()
  const user = session?.user
  const cart = await getMyCart()
  
  return (
    <div
      className={`
      sticky 
      flex 
      flex-col
      items-center 
      justify-between 
      w-full
      top-0 
      left-0
      bg-background 
      z-50
      `}
    >
      <Link href="/" className="py-2">
        <Logo />
      </Link>

      <div className="flex w-full justify-between px-5 lg:px-10 pb-2">
        {/* MENU BUTTON VISIBLE FOR MOBILE SCREEN */}
        {/* @ts-expect-error Server Component doesn't accept Client component like SessionProvider directly */}
        <SessionProvider session={session}>
          <MobileDrawer/>
        </SessionProvider>

        <div className="w-1/3">
          <SearchBar />
        </div>
        
        <div className="w-1/3 flex justify-center items-center">
          <NavLinks device="desktop" />
        </div>

        <div className="hidden lg:flex gap-5 justify-end items-center w-1/3">
          <ModeToggle />

          <Link
            href="/cart"
            className="hover:bg-accent relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group"
          >
            <div className="absolute bg-red-700 rounded-full text-white min-w-4 h-4 px-1 text-center text-xs -top-0.5 -right-px">
              {cart?.items.length}
            </div>
            <ShoppingBag />
          </Link>

          
          <Link href='/profile'>
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.image || ''} alt={user?.name||"User"}/>
              <AvatarFallback className="bg-orange-600 text-white">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* MOBILE CART BUTTON */}
        <Link
          href="/cart"
          className="hover:bg-neutral-300 relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group lg:hidden"
        >
          <div className="absolute bg-red-700 rounded-full text-white px-1 text-xs -top-0.5 -right-px">
            {cart?.items.length}
          </div>
          <ShoppingBag />
        </Link>

      </div>
    </div>
  );
};

export default Header;