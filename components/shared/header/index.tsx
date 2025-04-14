
import React from "react";
import NavLinks from "./nav-links";
import { ModeToggle } from "./mode-toggle";
import Logo from "./logo";
import Link from "next/link";
import { AlignJustify, ShoppingBag } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import SearchBar from "./search-bar";
import { auth } from "@/auth";
import CredentialsButton from "./credentials-button";
import { getMyCart } from "@/lib/actions/cart.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
        <Drawer>
          <DrawerTrigger className="lg:hidden">
            <AlignJustify />
          </DrawerTrigger>
          <DrawerContent className="px-10">
            <DrawerHeader className="flex-row items-center justify-between">
              <DrawerTitle className="w-min">Menu</DrawerTitle>
              <ModeToggle />
            </DrawerHeader>
            <NavLinks device="mobile" />
            <DrawerFooter>
              <CredentialsButton user={user!} />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <SearchBar />

        <NavLinks device="desktop" />

        <div className="hidden lg:flex gap-12 items-center">
          <ModeToggle />

          <Link
            href="/cart"
            className="hover:bg-accent relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group"
          >
            <div className="absolute bg-red-700 rounded-full text-white px-1 text-xs -top-0.5 -right-px">
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
          {/* <CredentialsButton user={user!}/> */}
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