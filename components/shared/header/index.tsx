import { Button } from "@/components/ui/button";
import React from "react";
import NavLinks from "./nav-links";
import { ModeToggle } from "./mode-toggle";
import Logo from "./logo";
import Link from "next/link";
import { AlignJustify } from "lucide-react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

const Header = () => {
  return (
    <div className="z-50 bg-background px-10 py-5 flex items-center justify-between gap-10 fixed w-full top-0 left-0">
      <Link href="/">
        <Logo />
      </Link>

      <NavLinks device="desktop"/>

      <div className="hidden md:flex gap-5">
        <ModeToggle />
        <Button>Login</Button>
        <Button variant="secondary">Sign Up</Button>
      </div>

      <Drawer>
        <DrawerTrigger className="md:hidden">
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
  );
};

export default Header;
