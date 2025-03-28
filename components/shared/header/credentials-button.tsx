'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOutUser } from "@/lib/actions/user.action"
import { LogOut, Settings2 } from "lucide-react"
import { User } from "next-auth"
import Link from "next/link"

const CredentialsButton = ({user}: {user: User}) => {
  if(user){
    return (
      <>
        <div className="hidden lg:flex items-center gap-2 max-w-36">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.image || ''} alt={user?.name||"User"}/>
                <AvatarFallback className="bg-orange-600 text-white">{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator/>
              <DropdownMenuItem className="flex justify-between">
                <Link href='/profile'>Settings</Link>
                <Settings2/>
              </DropdownMenuItem>
              <DropdownMenuItem> 
                <form action={signOutUser} className="flex justify-between w-full" >
                  <button className="flex-1 text-start">Logout</button>
                  <LogOut/>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-xs">Welcome back, {user?.name?.split(" ")[0]}</p>
        </div>
        <form action={signOutUser} className="flex lg:hidden">
          <Button variant='destructive' className="w-full uppercase tracking-widest">Log out</Button>
        </form>
      </>
    )
  } else {
    return(
      <>
        <Button asChild className="tracking-widest">
          <Link href={'/sign-in'}>Login</Link>
        </Button>
        <Button variant="outline" asChild className="tracking-widest">
          <Link href={'/sign-up'}>Sign Up</Link>
        </Button>
      </>
    )
  }
}

export default CredentialsButton