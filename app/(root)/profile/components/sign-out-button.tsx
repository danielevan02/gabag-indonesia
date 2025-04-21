'use client'

import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.action";

const SignOutButton = () => {
  return (
    <Button 
      className="w-full rounded-full uppercase tracking-widest cursor-pointer" 
      variant='destructive'
      onClick={()=>signOutUser()}
    >
      Sign Out
    </Button>
  );
}
 
export default SignOutButton;