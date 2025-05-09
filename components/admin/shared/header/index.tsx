import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Account from "./account";
import { User } from "next-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AdminHeader = ({user}: {user?: User}) => {
  return (
    <div className="py-3 px-5">
      <div className="flex justify-between items-center">
        <SidebarTrigger />

        <div className="hidden md:flex items-center gap-3 justify-center">
          <h1 className="text-2xl md:text-lg tracking-widest uppercase">Admin Panel</h1>
          <Image
            src="/images/black-logo.svg"
            alt="Gabag's Logo"
            width={130}
            height={90}
            className="md:w-28 xl:w-36"
          />
          <Button asChild className="rounded-full ml-5">
            <Link href='/' className="text-sm uppercase">Go to Gabag&apos;s Website</Link>
          </Button>
        </div>


        <Account user={user} />
      </div>
    </div>
  );
};

export default AdminHeader;
