import React from "react";
import NavLinks from "./nav-links";
import Link from "next/link";
import SearchBar from "./search-bar";
import { auth } from "../../../auth";
import MobileDrawer from "./mobile-drawer";
import CartModal from "../cart/cart-modal";
import Image from "next/image";
import { AuthSection } from "./auth-section";
import { OrderIconWithBadge } from "./order-icon-with-badge";

const Header = async () => {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="nav-container">
      <Link href="/" className="py-2">
        <Image
          src="/images/gabag-logo.png"
          alt="logo-gabag"
          width={200}
          height={100}
          className="w-32 max-h-96"
          priority
        />
      </Link>

      <div className="flex w-full justify-between px-5 lg:px-10 pb-2">
        {/* MENU BUTTON VISIBLE FOR MOBILE SCREEN */}
        <MobileDrawer />

        <div className="flex-1">
          <SearchBar />
        </div>

        <div className="flex-1 hidden lg:flex justify-center items-center">
          <NavLinks device="desktop" />
        </div>

        <div className="hidden lg:flex gap-5 justify-end items-center w-1/3">
          <CartModal userId={user?.id} />

          <OrderIconWithBadge userId={user?.id} />

          <AuthSection />
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
