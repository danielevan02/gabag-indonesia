import { Metadata } from "next";
import SignInForm from "./sign-in-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Sign In'
}

const SignInPage = async (props: {
  searchParams: Promise<{callbackUrl: string}>
}) => {
  const {callbackUrl} = await props.searchParams

  const session = await auth()
  if(session){
    return redirect(callbackUrl || '/')
  }
  return (
    <div className="w-full max-w-screen flex justify-center items-center h-screen px-5">
      <div className="w-xl">
        <h1 className="text-2xl text-center mb-10 uppercase tracking-widest">Login to Gabag Indonesia.</h1>
        <SignInForm/>
      </div>
    </div>
  );
}

export default SignInPage;