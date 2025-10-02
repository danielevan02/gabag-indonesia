"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nameSchema, phoneSchema } from "@/lib/schema";
import { Loader, Pencil } from "lucide-react";
import { HTMLInputTypeAttribute, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { getCurrentUser } from "@/lib/actions/user.action";
import ChangePasswordForm from "./change-password-form";

const ProfileForm = ({ user }: { user: Awaited<ReturnType<typeof getCurrentUser>> }) => {
  // for telling typescript that user is always defined
  user = user!;
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex w-full items-center mb-5 gap-3">
        <ProfileItem label="Name" value={user?.name} editable type="text" userId={user?.id} />
        <ProfileItem label="Phone" value={user?.phone} editable type="tel" userId={user?.id} />
      </div>
      <div className="flex w-full items-center gap-3">
        <ProfileItem label="Email" value={user?.email} />
        <div className="flex-1">
          <Label className="lg:text-base mb-5">Password</Label>
          <ChangePasswordForm userId={user?.id} />
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;

interface ProfileItemProps {
  label: string;
  value: string;
  editable?: boolean;
  type?: HTMLInputTypeAttribute;
  userId?: string;
}

const ProfileItem = ({ label, value, editable, type = "text", userId }: ProfileItemProps) => {
  const [onEdit, setOnEdit] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const { mutateAsync: updateProfile, isPending: isLoading } = trpc.auth.updateProfile.useMutation({
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message as string);
        setOnEdit(false);
        // Update fieldValue dengan nilai terbaru setelah sukses update
      } else {
        toast.error(res?.message as string);
        // Reset fieldValue ke nilai asli jika gagal
        setFieldValue(value);
      }
    },
  });

  const isName = label.toLowerCase() === "name";
  const isPhone = label.toLowerCase() === "phone";

  const handleSubmit = async () => {
    // Validasi
    if (isName) {
      const result = nameSchema.safeParse(fieldValue);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
    } else if (isPhone) {
      const result = phoneSchema.safeParse({ phone: fieldValue });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
    }

    // Submit update
    await updateProfile({
      userId: userId!,
      ...(isName && { name: fieldValue }),
      ...(isPhone && { phone: fieldValue }),
    });
  };

  return (
    <div className="flex-1">
      <Label className="lg:text-base mb-2 capitalize">{label}</Label>

      {onEdit ? (
        <Input
          type={type}
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          pattern={isPhone ? "^08[0-9]{7,11}$" : undefined}
          placeholder={isPhone ? "08**********" : ""}
        />
      ) : (
        <p className="text-sm lg:text-base">{fieldValue}</p>
      )}

      {editable &&
        (onEdit ? (
          <div className="flex gap-2 mt-3">
            <Button
              onClick={() => {
                setOnEdit(false);
                setFieldValue(value); // Reset ke nilai asli saat cancel
              }}
              variant="outline"
              className="uppercase"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="uppercase" disabled={isLoading}>
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="mt-3" onClick={() => setOnEdit(true)}>
            <Pencil className="h-3 w-3" />
            <span>Edit</span>
          </Button>
        ))}
    </div>
  );
};
