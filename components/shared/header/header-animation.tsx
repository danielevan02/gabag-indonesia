"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

const HeaderAnimation = ({ children }: { children: ReactNode }) => {
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsTop(window.scrollY <= 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div
      className={cn(
        `
      sticky 
      flex 
      flex-col
      items-center 
      justify-between 
      w-full
      top-0 
      left-0
      bg-background 
      z-50
      transition-all
      `,
        isTop ? "bg-transparent" : "bg-background"
      )}
    >
      {children}
    </div>
  );
};

export default HeaderAnimation;
