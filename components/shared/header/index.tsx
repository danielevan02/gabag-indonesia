import { Button } from "@/components/ui/button";
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

const Header = async () => {
  return (
    <div
      className={`
      sticky 
      flex 
      flex-col
      items-center 
      justify-between 
      w-screen
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
              <Button>Login</Button>
              <Button variant="secondary">Sign Up</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <SearchBar />

        <NavLinks device="desktop" />

        <div className="hidden lg:flex gap-5">
          <Link
            href="/cart"
            className="hover:bg-accent relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group"
          >
            <div className="absolute bg-red-700 rounded-full text-white px-1 text-xs -top-0.5 -right-px">
              0
            </div>
            <ShoppingBag />
          </Link>
          <ModeToggle />
          <Button asChild className="tracking-widest">
            <Link href={'/sign-in'}>Login</Link>
          </Button>
          <Button variant="outline" asChild className="tracking-widest">
            <Link href={'/sign-up'}>Sign Up</Link>
          </Button>
        </div>

        {/* MOBILE CART BUTTON */}
        <Link
          href="/cart"
          className="hover:bg-neutral-300 relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group lg:hidden"
        >
          <div className="absolute bg-red-700 rounded-full text-white px-1 text-xs -top-0.5 -right-px">
            0
          </div>
          <ShoppingBag />
        </Link>

      </div>
    </div>
  );
};

export default Header;
