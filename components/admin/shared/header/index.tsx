import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Account from "./account";
import { User } from "next-auth";

const AdminHeader = ({user}: {user?: User}) => {
  return (
    <div className="py-3 px-5 h-1/12">
      <div className="flex justify-between items-center">
        <SidebarTrigger />

        <div className="hidden md:flex items-center gap-3 justify-center mx-auto">
          <h1 className="text-2xl md:text-lg tracking-widest uppercase">Admin Panel</h1>
          <Image
            src="/images/black-logo.svg"
            alt="Gabag's Logo"
            width={130}
            height={90}
            className="md:w-28 xl:w-36"
          />
        </div>

        <Account user={user} />
      </div>
    </div>
  );
};

export default AdminHeader;
