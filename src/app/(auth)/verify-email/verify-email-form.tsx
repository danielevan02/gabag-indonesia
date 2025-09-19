"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { CircleCheckBig, CircleX, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const VerifyEmailForm = () => {
  const [isLoading, startTransition] = useTransition();
  const [success, setSuccess] = useState(true);
  const [icon, setIcon] = useState(<Loader className="animate-spin" />);
  const [message, setMessage] = useState("Your email is being confirmed, please wait...");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: (res) => {
      setMessage(res?.message as string);
      setIcon(<CircleCheckBig className="text-green-700" />);
    },
    onError: (res) => {
      setSuccess(false);
      setMessage(res.message as string);
      setIcon(<CircleX className="text-red-700" />);
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    startTransition(async () => {
      await verifyEmailMutation.mutateAsync({token})
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]);

  return isLoading ? (
    <div className="flex flex-col items-center gap-4">
      <p className="animate-pulse w-72 md:w-auto text-center">{message}</p>
      {icon}
    </div>
  ) : (
    <div className="flex flex-col items-center gap-4">
      <p className="w-72 text-center">
        {!success
          ? "An error has been occurred while confirming your email."
          : "Your email has been verified, please continue to the login page."}
      </p>
      <div className={cn("flex p-5 rounded-xl gap-2", success ? "bg-green-100" : "bg-red-100")}>
        {icon}
        <p className={cn("text-center", success ? "text-green-700" : "text-red-700")}>{message}</p>
      </div>
      <Button asChild className="rounded-full mt-10">
        <Link href="/sign-in" className="uppercase tracking-widest">
          Continue to Login
        </Link>
      </Button>
    </div>
  );
};

export default VerifyEmailForm;
