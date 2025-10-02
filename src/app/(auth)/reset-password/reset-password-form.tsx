"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordType = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter();
  const form = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message);
        router.push("/sign-in");
      } else {
        toast.error(res?.message);
      }
    },
  });

  const onSubmit = (data: ResetPasswordType) => {
    resetPasswordMutation.mutate({
      token,
      password: data.password,
    });
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FormInput
          form={form}
          label="New Password"
          fieldType="password"
          name="password"
          placeholder="Enter your new password"
          showPass
        />

        <FormInput
          form={form}
          label="Confirm Password"
          fieldType="password"
          name="confirmPassword"
          placeholder="Confirm your new password"
          showPass
        />

        <Button
          className="w-fit ml-auto tracking-widest rounded-full py-7 px-10 min-w-40 text-lg"
          type="submit"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            <Loader className="animate-spin" />
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
