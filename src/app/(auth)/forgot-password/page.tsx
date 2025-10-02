import { Metadata } from "next";
import ForgotPasswordForm from "./forgot-password-form";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Forgot Password",
};

const ForgotPasswordPage = async () => {
  const session = await auth();
  if (session) {
    return redirect("/");
  }

  return (
    <div className="w-full max-w-screen flex justify-center items-center h-screen px-5">
      <div className="w-xl">
        <h1 className="text-2xl text-center mb-10 uppercase tracking-widest">
          Forgot Password
        </h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;