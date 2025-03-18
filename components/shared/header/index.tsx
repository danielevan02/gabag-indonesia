import { Button } from "@/components/ui/button";
import React from "react";
import NavLinks from "./nav-links";
import { ModeToggle } from "./mode-toggle";
import Logo from "./logo";
import Link from "next/link";
import { AlignJustify, ShoppingBag } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import SearchBar from "./search-bar";

const Header = async () => {
  return (
    <div className="z-50 bg-background px-5 pt-5 pb-2 md:px-10 md:py-5 flex items-center justify-between gap-10 fixed w-full top-0 left-0">
      <Link href="/">
        <Logo />
      </Link>

      <NavLinks device="desktop"/>
      
      <div className="hidden lg:flex gap-5">
        <SearchBar/>  
        <Link href='/cart' className="hover:bg-accent relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group">
          <div className="absolute bg-red-700 rounded-full text-white px-1 text-xs -top-0.5 -right-px">0</div>
          <ShoppingBag/>
        </Link>
        <ModeToggle />
        <Button>Login</Button>
        <Button variant="secondary">Sign Up</Button>
      </div>

      <div className="block md:hidden absolute top-[85px] inset-x-4 bg-background pb-3">
        <SearchBar/>
      </div>

      <div className="flex lg:hidden gap-4 items-center">
        <div className="hidden md:block lg:hidden">
          <SearchBar/>
        </div>
        <Link href='/cart' className="hover:bg-neutral-300 relative rounded-lg w-10 h-10 flex items-center justify-center transition-all group">
          <div className="absolute bg-red-700 rounded-full text-white px-1 text-xs -top-0.5 -right-px">0</div>
          <ShoppingBag/>
        </Link>

        <Drawer>
          <DrawerTrigger className="lg:hidden">
            <div className="border p-2 rounded-md">
              <AlignJustify />
            </div>
          </DrawerTrigger>
          <DrawerContent className="px-10">
            <DrawerHeader className="flex-row items-center justify-between">
              <DrawerTitle className="w-min">Menu</DrawerTitle>
              <ModeToggle/>
            </DrawerHeader>
            <NavLinks device="mobile"/>
            <DrawerFooter>
              <Button>Login</Button>
              <Button variant="secondary">Sign Up</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default Header;
