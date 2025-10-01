"use client"

import * as React from "react"
import { NavMain } from "@/components/admin/nav-main"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SessionProvider } from "next-auth/react"
import { NavHeader } from "./nav-header"
import { navLink } from "@/lib/constants"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navLink.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SessionProvider>
          <NavUser/>
        </SessionProvider>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
