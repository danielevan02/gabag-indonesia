import { getCurrentUser } from "@/lib/actions/user.action";
import ProfileForm from "./components/profile-form";
import AddressForm from "./components/address-form";

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
          <div className="bg-blue-600 w-full max-w-2xl">
            
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default ProfilePage;