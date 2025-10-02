import { Metadata } from "next";
import ResetPasswordForm from "./reset-password-form";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reset Password",
};

const ResetPasswordPage = async (props: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await props.searchParams;

  const session = await auth();
  if (session) {
    return redirect("/");
  }

  if (!token) {
    return (
      <div className="w-full max-w-screen flex justify-center items-center h-screen px-5">
        <div className="w-xl text-center">
          <h1 className="text-2xl mb-5 uppercase tracking-widest">Invalid Reset Link</h1>
          <p className="mb-5">The password reset link is invalid or missing.</p>
          <Link href="/forgot-password" className="underline hover:text-blue-900">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen flex justify-center items-center h-screen px-5">
      <div className="w-xl">
        <h1 className="text-2xl text-center mb-10 uppercase tracking-widest">
          Reset Your Password
        </h1>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
