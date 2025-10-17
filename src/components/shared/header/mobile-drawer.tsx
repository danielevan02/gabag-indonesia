"use client";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AlignJustify, ClipboardList, Pencil, ShieldUser } from "lucide-react";
import NavLinks from "./nav-links";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "../tooltip-wrapper";

const MobileDrawer = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const session = useSession();
  const user = session.data?.user;
  const [open, setOpen] = useState(false);

  const splitName = (user?.name?.includes(" ") && user?.name?.split(" ")) || [user?.name];
  useEffect(() => {
    setOpen(false);
  }, [pathname, category]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="lg:hidden px-2">
        <AlignJustify />
      </DrawerTrigger>
      <DrawerContent className="px-10">
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle className="w-min">Menu</DrawerTitle>
          <div className="flex items-center gap-2">
            <Link href="/orders" className="focus:ring-blue-400 focus:outline-none focus:ring-2 transition-all rounded-md p-2">
              <ClipboardList className="size-6" />
            </Link>   
            {user?.role === "admin" && (
              <TooltipWrapper text="Admin Panel">
                <Link
                  href="/admin/dashboard"
                  className="cursor-pointer hover:bg-accent rounded-md p-2"
                >
                  <ShieldUser className="w-6 h-6" />
                </Link>
              </TooltipWrapper>
            )}
          </div>
        </DrawerHeader>
        <NavLinks device="mobile" />
        <DrawerFooter>
          {user ? (
            <Link
              prefetch
              href="/profile"
              className="flex items-center justify-between gap-2 bg-blue-50 dark:bg-blue-950 p-1 rounded-full w-full"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image || ""} alt={user?.name || ""} className="size-full object-cover" />
                  <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black">
                    {splitName[0]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm line-clamp-1">{user?.name}</p>
              </div>
              <Pencil className="h-4 w-4 mr-3" />
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Button asChild className="tracking-widest">
                <Link href={"/sign-in"}>Login</Link>
              </Button>
              <Button variant="outline" asChild className="tracking-widest">
                <Link href={"/sign-up"}>Sign Up</Link>
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
