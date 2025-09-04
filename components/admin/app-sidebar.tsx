"use client"

import * as React from "react"
import {
  BookImage,
  Calendar,
  SquareTerminal,
} from "lucide-react"

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    navMain: [
      {
        title: "Catalog",
        url: "/admin/catalog",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Category",
            url: '/admin/catalog/category',
          },
          {
            title: "Sub Category",
            url: "/admin/catalog/sub-category",
          },
          {
            title: "Product",
            url: "/admin/catalog/product",
          },
        ],
      },
      {
        title: "Image Gallery",
        url: "/admin/gallery",
        icon: BookImage,
      },
      {
        title: "Events",
        url: "/admin/events",
        icon: Calendar
      }
    ],
  }
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
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
