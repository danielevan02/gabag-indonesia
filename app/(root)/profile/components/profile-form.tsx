"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/user.action";
import { nameSchema, phoneSchema } from "@/lib/schema";
import { User } from "@/types";
import { Pencil } from "lucide-react";
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
  const [phone, setPhone] = useState(value)
  const [name, setName] = useState(value)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async () => {
    setIsLoading(true)
    if(label.toLowerCase() === 'name'){
      const testName = nameSchema.safeParse(name)

      if(!testName.success) {
        return (
          toast.error(testName.error.errors[0].message),
          setIsLoading(false)
        )
      }

      const res = await updateProfile({userId: userId!, name})
      if(res.success){
        toast.success(res.message as string)
        setOnEdit(false)
        setIsLoading(false)
      } else {
        toast.error(res.message as string)
        setIsLoading(false)
      }
    } else {
      const testPhone = phoneSchema.safeParse({phone})
      if(!testPhone.success) {
        return (
          toast.error(testPhone.error.errors[0].message),
          setIsLoading(false)
        )
      }

      const res = await updateProfile({userId: userId!, phone: testPhone.data?.phone})
      if(res.success){
        toast.success(res.message as string)
        setOnEdit(false)
        setIsLoading(false)
      } else {
        toast.error(res.message as string)
        setIsLoading(false)
      }
    }
    setIsLoading(false)
  };
  return (
    <div className="flex-1 ">
      <Label className="lg:text-base mb-2 capitalize">{label}</Label>

      {onEdit ? (
        type === "text" ? (
          <Input 
            defaultValue={value} 
            type={type} 
            onChange={(e) => setName(e.target.value)} 
          />
        ) : (
          <Input
            defaultValue={value}
            type={type}
            pattern="^\+62[0-9]{9,13}$"
            placeholder="+628**********"
            onChange={(e)=>setPhone(e.target.value)}
          />
        )
      ) : (
        <p className="text-sm lg:text-base">{value}</p>
      )}
      {editable &&
        (onEdit ? (
          <div className="flex gap-2 mt-3">
            <Button onClick={() => setOnEdit(false)} variant="outline" className="uppercase">
              Cancel
            </Button>
            <Button className="uppercase" onClick={handleSubmit} disabled={isLoading}>Save</Button>
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
