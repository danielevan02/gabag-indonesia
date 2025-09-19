"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/refactor-form-field";

type LoginType = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const router = useRouter();
  const form = useForm<LoginType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        router.push("/")
      } else {
        toast.error(res.message)
      }
    },
  });

  const onSubmit = (data: LoginType) => {
    signInMutation.mutate(data);
  };
  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          form={form}
          label="Email"
          fieldType="text"
          name="email"
          placeholder="Enter your email"
          type="text"
        />

        <FormInput
          form={form}
          label="Password"
          fieldType="password"
          name="password"
          placeholder="Enter your password"
          showPass
        />

        <p className="mb-5 md:mb-0">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="underline hover:text-blue-900">
            Create Account
          </Link>
        </p>

        <Button
          className="w-fit ml-auto tracking-widest rounded-full py-7 px-10 min-w-40 text-lg"
          type="submit"
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? <Loader className="animate-spin" /> : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
