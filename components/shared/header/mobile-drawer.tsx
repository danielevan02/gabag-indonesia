"use client";

import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { AlignJustify, Pencil } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import NavLinks from "./nav-links";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {useSession} from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

const MobileDrawer = () => {
  const pathname = usePathname()
  const session = useSession()
  const user = session.data?.user
  const [open, setOpen] = useState(false)
  
  const splitName = user?.name?.split(" ")
  useEffect(()=>{
    setOpen(false)
  }, [pathname])

  return (
    <Drawer open={open} onOpenChange={setOpen}>
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
          <Link prefetch href='/profile' className="flex items-center justify-between gap-2 bg-blue-50 dark:bg-blue-950 p-1 rounded-full w-full">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.image||""} alt={user?.name||""}/>
                <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black">{splitName![0].charAt(0) + splitName![1].charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm line-clamp-1">{user?.name}</p>
            </div>
            <Pencil className="h-4 w-4 mr-3"/>
          </Link>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MobileDrawer;
