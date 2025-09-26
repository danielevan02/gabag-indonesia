'use client'

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";

const SignOutButton = () => {
  return (
    <Button 
      className="w-full rounded-full uppercase tracking-widest cursor-pointer" 
      variant='destructive'
      onClick={()=>trpc.auth.signOut.useMutation()}
    >
      Sign Out
    </Button>
  );
}
 
export default SignOutButton;