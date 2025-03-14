'use client'

import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

const Logo = () => {
  const {theme} = useTheme()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="rounded-lg w-44 h-10"/>
        <Skeleton className="rounded-lg h-5"/>
      </div>
    )// Placeholder saat loading
  }
  return (
    <Image
      src={`/images/${theme === 'light' ? 'black-logo.svg':'white-logo.svg'}`}
      alt="Gabag Indonesia Logo"
      className="w-44 md:w-64"
      width={1000}
      height={1000}
      priority
    />
  );
};

export default Logo;
