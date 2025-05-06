import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { Boxes, ChevronRight, TicketPercent } from "lucide-react";
import Link from "next/link";

const AdminSidebar = () => {
  const links = [
    {
      menu: "catalog",
      Icon: Boxes,
      subMenu: [
        { label: "category", link: "/admin/catalog/category" },
        { label: "sub category", link: "/admin/catalog/sub-category" },
        { label: "product", link: "/admin/catalog/product" },
      ],
    },
    {
      menu: "voucher",
      Icon: TicketPercent,
      link: "/admin/voucher",
    },
  ];

  return (
    <Sidebar>
      <SidebarMenu className="p-2">
        {links.map(({ Icon, link, menu, subMenu }, index) =>
          subMenu ? (
            <Collapsible key={index} defaultOpen className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="capitalize font-medium tracking-widest text-base">
                    <Icon />
                    {menu}
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {subMenu.map((sub, subIndex) => (
                      <SidebarMenuButton key={subIndex} className="text-sm capitalize" asChild>
                        <Link href={sub.link}>{sub.label}</Link>
                      </SidebarMenuButton>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={index}>
              <SidebarMenuButton className="capitalize font-medium tracking-widest text-base" asChild>
                <Link href={link}>
                  <Icon />
                  {menu}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </Sidebar>
  );
};

export default AdminSidebar;
