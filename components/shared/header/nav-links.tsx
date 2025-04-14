"use client";

import { cn } from "@/lib/utils";
import { Boxes, ClipboardList, HomeIcon, Info, LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface LinkType {
  label: string;
  link: string;
  icon: LucideIcon;
}

const NavLinks = ({device}: {device: string}) => {
  const path = usePathname();
  const links: LinkType[] = [
    { label: "Home", link: "/", icon: HomeIcon },
    { label: "Mother", link: "/products", icon: Boxes },
    { label: "Kids", link: "/products/kids", icon: Boxes },
    { label: "Beauty", link: "/products/beauty", icon: Boxes },
    { label: "Order", link: "/orders", icon: ClipboardList },
    { label: "About", link: "/about", icon: Info },
  ];
  if(device === 'desktop'){
    return (
      <div className="justify-between gap-5 hidden lg:flex items-center">
        {links.map(({ icon: Icon, label, link }) => (
          <div key={link} className="relative flex justify-center items-center group">
            <Icon
              className={cn(
                "absolute opacity-0 group-hover:opacity-100 transition-all",
                (path === link || (link !== "/" && path.startsWith(link))) && "opacity-100"
              )}
            />
            <Link
              key={link}
              href={link}
              className={cn("group-hover:opacity-0 transition-all uppercase text-xs tracking-widest", 
                (path === link || (link !== "/" && path.startsWith(link))) && "opacity-0",
              )}
            >
              {label}
            </Link>
          </div>
        ))}
      </div>
    );
  } else {
    return(
      <div className="flex flex-col gap-2">
        {links.map(({icon: Icon, label, link})=>(
          <Link href={link} key={link} className={cn("flex gap-3 rounded-lg p-2 items-center uppercase", 
            (path === link || (link !== "/" && path.startsWith(link))) && 'bg-neutral-100 dark:bg-neutral-800'
          )}>
            <Icon/>
            <span className="text-xs">
              {label}
            </span>
          </Link>
        ))}
      </div>
    )
  }
};

export default NavLinks;
