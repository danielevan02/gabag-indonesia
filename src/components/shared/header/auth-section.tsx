"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "../tooltip-wrapper";
import { ShieldUser } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export const AuthSection = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      {session?.user?.role === "admin" && (
        <TooltipWrapper text="Admin Panel">
          <Link
            href="/admin/dashboard"
            className="cursor-pointer hover:bg-accent rounded-md p-2"
          >
            <ShieldUser className="size-6" />
          </Link>
        </TooltipWrapper>
      )}

      {!session ? (
        <div className="flex gap-2">
          <Button asChild className="tracking-widest">
            <Link href={"/sign-in"}>Login</Link>
          </Button>
          <Button variant="outline" asChild className="tracking-widest">
            <Link href={"/sign-up"}>Sign Up</Link>
          </Button>
        </div>
      ) : (
        <Link href="/profile">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={user?.image || ""}
              alt={user?.name || "User"}
              className="object-cover"
            />
            <AvatarFallback className="bg-orange-600 text-white">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
      )}
    </>
  );
};
