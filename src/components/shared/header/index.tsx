import React from "react";
import NavLinks from "./nav-links";
import Link from "next/link";
import SearchBar from "./search-bar";
import { auth } from "../../../auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MobileDrawer from "./mobile-drawer";
import { SessionProvider } from "next-auth/react";
import { Button } from "@/components/ui/button";
import CartModal from "../cart/cart-modal";
import { TooltipWrapper } from "../tooltip-wrapper";
import { ShieldUser } from "lucide-react";
import Image from "next/image";

const Header = async () => {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="nav-container">
      <Link href="/" className="py-2">
        <Image
          src="/images/black-logo.svg"
          alt="logo-gabag"
          width={200}
          height={100}
          className="w-32 lg:w-52 max-h-96"
          priority
        />
      </Link>

      <div className="flex w-full justify-between px-5 lg:px-10 pb-2">
        {/* MENU BUTTON VISIBLE FOR MOBILE SCREEN */}
        {/* @ts-expect-error just react 19 issue */}
        <SessionProvider session={session}>
          <MobileDrawer />
        </SessionProvider>

        <div className="w-1/3">
          <SearchBar />
        </div>

        <div className="w-1/3 flex justify-center items-center">
          <NavLinks device="desktop" />
        </div>

        <div className="hidden lg:flex gap-5 justify-end items-center w-1/3">
          <CartModal userId={user?.id} />

          {session?.user?.role === "admin" && (
            <TooltipWrapper text="Admin Panel">
              <Link
                href="/admin/dashboard"
                className="cursor-pointer hover:bg-muted rounded-md p-2"
              >
                <ShieldUser className="w-6 h-6" />
              </Link>
            </TooltipWrapper>
          )}

          {!session ? (
            <div className="flex gap-2">
              <Button asChild className="tracking-widest">
                <Link href={"/sign-in"}>Login</Link>
              </Button>
              <Button variant="outline" asChild className="tracking-widest">
                <Link href={"/sign-up"}>Sign Up</Link>
              </Button>
            </div>
          ) : (
            <Link href="/profile">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-orange-600 text-white">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>

        {/* MOBILE CART BUTTON */}
        <div className="lg:hidden">
          <CartModal userId={user?.id} />
        </div>
      </div>
    </div>
  );
};

export default Header;
