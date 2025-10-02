"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordType = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message);
        form.reset();
      } else {
        toast.error(res?.message);
      }
    },
  });

  const onSubmit = (data: ForgotPasswordType) => {
    forgotPasswordMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          form={form}
          label="Email"
          fieldType="text"
          name="email"
          placeholder="Enter your email address"
          type="email"
        />

        <p className="text-sm text-gray-600 mb-5">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Link href="/sign-in" className="text-sm underline hover:text-blue-900">
            Back to Login
          </Link>

          <Button
            className="w-fit ml-auto tracking-widest rounded-full py-7 px-10 min-w-40 text-lg"
            type="submit"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <Loader className="animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
