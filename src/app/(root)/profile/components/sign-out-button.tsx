import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.action";

const SignOutButton = () => {
  return (
    <form action={signOutUser}>
      <Button
        type="submit"
        className="w-full rounded-full uppercase tracking-widest cursor-pointer"
        variant='destructive'
      >
        Sign Out
      </Button>
    </form>
  );
}
 
export default SignOutButton;