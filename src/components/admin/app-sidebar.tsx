"use client"

import * as React from "react"
import {
  BookImage,
  Calendar,
  ScrollText,
  SquareTerminal,
  TicketPercent,
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
        url: "/admin/event",
        icon: Calendar
      },
      {
        title: "Voucher",
        url: "/admin/voucher",
        icon: TicketPercent
      },
      {
        title: "Order",
        url: "/admin/order",
        icon: ScrollText
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
        {/* @ts-expect-error - next-auth beta compatibility issue with React 19 */}
        <SessionProvider>
          <NavUser/>
        </SessionProvider>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
