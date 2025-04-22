import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { User } from "next-auth";

const AccountButton = ({user}: {user?: User}) => {
  const splitName = user?.name?.split(' ')||''
  const userName = `${splitName[0]} ${splitName[1]}`
  return (
    <div className="w-fit flex items-center gap-2 cursor-pointer rounded-full hover:bg-neutral-100 transition p-1">
      <Avatar className="w-10 h-10">
        <AvatarImage
          src={user?.image || "/images/user-placeholder.png"}
          className="w-full h-full object-cover"
        />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 items-start">
        <p className="text-xs font-semibold">{userName}</p>
        <p className="text-xs text-neutral-600">Administrator</p>
      </div>
      <ChevronDown className="text-neutral-400" />
    </div>
  );
}
 
export default AccountButton;