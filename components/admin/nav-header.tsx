'use client'

import Image from "next/image";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "../ui/sidebar";
import { APP_NAME } from "@/lib/constants";

export function NavHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Image
              src="/images/logo.png"
              alt="Gabag's Logo"
              width={32}
              height={32}
              className="size-4"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{APP_NAME}</span>
            <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
