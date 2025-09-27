import { Metadata } from "next";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign Up",
};

const SignUpPage = async (props: { searchParams: Promise<{ callbackUrl: string }> }) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();
  if (session) {
    return redirect(callbackUrl || "/");
  }
  return (
    <div className="w-full max-w-screen px-5">
      <div className="w-full md:max-w-xl mx-auto min-h-screen flex flex-col py-10">
        <div className="flex-1 md:w-xl flex flex-col justify-center">
          <h1 className="text-2xl text-center mb-10 uppercase tracking-widest">
            Create your account
          </h1>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
