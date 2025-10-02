"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/shared/input/form-input";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useState } from "react";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordType = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  userId: string;
}

const ChangePasswordForm = ({ userId }: ChangePasswordFormProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<ChangePasswordType>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: (res) => {
      if (!res) {
        toast.error("Failed to change password");
        return;
      }

      if (res.success) {
        toast.success(res.message);
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.message || "Failed to change password");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An error occurred while changing password");
    },
  });

  const onSubmit = (data: ChangePasswordType) => {
    changePasswordMutation.mutate({
      userId,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              form={form}
              label="Current Password"
              fieldType="password"
              name="currentPassword"
              placeholder="Enter your current password"
              showPass
            />

            <FormInput
              form={form}
              label="New Password"
              fieldType="password"
              name="newPassword"
              placeholder="Enter your new password"
              showPass
            />

            <FormInput
              form={form}
              label="Confirm New Password"
              fieldType="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              showPass
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
                disabled={changePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordForm;
