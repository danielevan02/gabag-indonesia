"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/user.action";
import { nameSchema, phoneSchema } from "@/lib/schema";
import { User } from "@/types";
import { Loader, Pencil } from "lucide-react";
import { HTMLInputTypeAttribute, useState } from "react";
import { toast } from "sonner";

const ProfileForm = ({ user }: { user: User }) => {
  return (
    <div className="w-full flex flex-col gap-5">
      <div className="flex w-full items-center mb-5 gap-3">
        <ProfileItem label="Name" value={user.name} editable type="text" userId={user.id}/>
        <ProfileItem label="Phone" value={user.phone} editable type="tel" userId={user.id}/>
      </div>
      <div className="flex w-full items-center gap-3">
        <ProfileItem label="Email" value={user.email} />
        <div className="flex-1">
          <Label className="lg:text-base mb-5">Password</Label>
          <Button variant="outline" className="cursor-pointer">
            Reset Password
          </Button>
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
  const [isLoading, setIsLoading] = useState(false);

  const isName = label.toLowerCase() === "name";
  const isPhone = label.toLowerCase() === "phone";

  const handleSubmit = async () => {
    setIsLoading(true);

    // Validasi
    if (isName) {
      const result = nameSchema.safeParse(fieldValue);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return setIsLoading(false);
      }
    } else if (isPhone) {
      const result = phoneSchema.safeParse({ phone: fieldValue });
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return setIsLoading(false);
      }
    }

    // Submit update
    const res = await updateProfile({
      userId: userId!,
      ...(isName && { name: fieldValue }),
      ...(isPhone && { phone: fieldValue }),
    });

    if (res.success) {
      toast.success(res.message as string);
      setOnEdit(false);
    } else {
      toast.error(res.message as string);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex-1">
      <Label className="lg:text-base mb-2 capitalize">{label}</Label>

      {onEdit ? (
        <Input
          type={type}
          defaultValue={value}
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          pattern={isPhone ? "^\\+62[0-9]{9,13}$" : undefined}
          placeholder={isPhone ? "+628**********" : ""}
        />
      ) : (
        <p className="text-sm lg:text-base">{value}</p>
      )}

      {editable &&
        (onEdit ? (
          <div className="flex gap-2 mt-3">
            <Button onClick={() => setOnEdit(false)} variant="outline" className="uppercase" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="uppercase" disabled={isLoading}>
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin"/>
              ):(
                "Save"
              )}
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