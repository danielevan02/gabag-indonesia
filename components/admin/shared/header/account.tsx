"use client";

import { User } from "next-auth";
import AccountButton from "./account-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User as UserIcon } from "lucide-react";
import { signOutUser } from "@/lib/actions/user.action";

const Account = ({ user }: { user?: User }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AccountButton user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex justify-between">
              <span className="text-neutral-600">Profile</span>
              <UserIcon />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <Button className="w-full" variant="destructive" onClick={() => signOutUser()}>
          Log out
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Account;
