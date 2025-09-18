"use client";

import { cn } from "@/lib/utils";
import { Baby, ClipboardList, HandHeart, HomeIcon, Info, LucideIcon, Sparkles } from "lucide-react";
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
    { label: "Mom", link: "/products?category=e827dd23-8c59-4360-bcd7-147e3d5a5224", icon: HandHeart },
    { label: "Beauty", link: "/products?category=6329a950-5652-476d-94c6-7a73381936a5", icon: Sparkles },
    { label: "Kids", link: "/products?category=4bea0680-9151-4372-9b5d-b8dc0f9e77b8", icon: Baby },
    { label: "Order", link: "/orders", icon: ClipboardList },
    { label: "About", link: "/about", icon: Info },
  ];
  if(device === 'desktop'){
    return (
      <div className="justify-center gap-5 hidden lg:flex items-center">
        {links.map(({ icon: Icon, label, link }) => (
          <div key={link} className="relative flex justify-center items-center group">
            <Icon
              className={cn(
                "absolute opacity-0 group-hover:opacity-100 transition-all",
                (path === link || (link !== "/" && path.startsWith(link))) && "opacity-100"
              )}
              strokeWidth={1}
            />
            <Link
              prefetch
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
