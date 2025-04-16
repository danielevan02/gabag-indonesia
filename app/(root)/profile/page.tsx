import { getCurrentUser } from "@/lib/actions/user.action";
import ProfileForm from "./components/profile-form";
import AddressForm from "./components/address-form";
import Image from "next/image";

const ProfilePage = async () => {
  const user = await getCurrentUser()
  return (
    <div className="w-full max-w-screen min-h-screen">
      <div className="flex flex-col w-full py-5 lg:py-10 px-5 lg:px-20">
        <h1 className="text-xl lg:text-3xl font-medium mb-5">Your Profile</h1>
        <div className="w-full flex flex-col-reverse lg:flex-row justify-center gap-5">
          <div className="w-full max-w-2xl">
            <ProfileForm user={user!} />
            <AddressForm address={user?.address} id={user?.id||""}/>
          </div>
          <div className="relative w-full max-w-2xl">
            <div className="lg:sticky lg:top-1/2 lg:-translate-y-1/2 w-full flex justify-center">
              <div className="rounded-full w-1/2 min-w-72 overflow-hidden">
                <Image
                  src={user?.image || '/images/user-placeholder.png'}
                  alt={user?.name||'User Profile'}
                  width={720}
                  height={720}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default ProfilePage;