"use client";

import { cn } from "@/lib/utils";
import { Baby, HandHeart, HomeIcon, Info, LucideIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface LinkType {
  label: string;
  link: string;
  icon: LucideIcon;
}

const NavLinks = ({device}: {device: string}) => {
  const path = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const links: LinkType[] = [
    { label: "Home", link: "/", icon: HomeIcon },
    { label: "Mom", link: "/products?category=f6a1e8e9-5a62-4f4b-a429-ffc8276a11e9", icon: HandHeart },
    { label: "Beauty", link: "/products?category=f4b48800-d115-4384-a109-98725e506730", icon: Sparkles },
    { label: "Kids", link: "/products?category=d3cfc5e0-e98e-4b71-92bd-46a238e787c5", icon: Baby },
    { label: "About", link: "/about", icon: Info },
  ];

  // Helper function to check if link is active
  const isLinkActive = (link: string) => {
    if (link === "/") {
      return path === "/";
    }

    // For products pages with category query
    if (link.includes("/products?category=")) {
      const linkCategory = new URL(link, 'http://dummy.com').searchParams.get('category');
      return path === "/products" && currentCategory === linkCategory;
    }

    // For other pages
    return path === link || (link !== "/" && path.startsWith(link));
  };
  if(device === 'desktop'){
    return (
      <div className="justify-center gap-5 hidden lg:flex items-center">
        {links.map(({ icon: Icon, label, link }) => (
          <div key={link} className="relative flex justify-center items-center group">
            <Icon
              className={cn(
                "absolute opacity-0 group-hover:opacity-100 transition-all",
                isLinkActive(link) && "opacity-100"
              )}
              strokeWidth={1}
            />
            <Link
              prefetch
              key={link}
              href={link}
              className={cn("group-hover:opacity-0 transition-all uppercase text-xs tracking-widest",
                isLinkActive(link) && "opacity-0",
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
            isLinkActive(link) && 'bg-neutral-100 dark:bg-neutral-800'
          )}>
            <Icon strokeWidth={1}/>
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
