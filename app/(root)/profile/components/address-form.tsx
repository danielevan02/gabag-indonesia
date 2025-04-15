'use client'

import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateAddress } from "@/lib/actions/user.action";
import { addressSchema } from "@/lib/schema";
import { Address } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type AddressFormType = z.infer<typeof addressSchema>

const AddressForm = ({address, id}: {address?: Address; id: string}) => {
  const [edit, setEdit] = useState(false)
  const [isLoading, startTransition] = useTransition()

  const {
    register,
    formState: {errors},
    handleSubmit
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: address?.province || "",
      city: address?.city || "",
      district: address?.district || "",
      village: address?.village || "",
      postalCode: address?.postalCode || "",
      address: address?.address || "",
    }
  })

  const onSubmit = async (data: AddressFormType) => {
    startTransition(async () => {
      const res = await updateAddress({address: data, id})
      if(res.success){
        toast.success(res.message as string)
        setEdit(false)
      } else {
        toast.error(res.message as string)
      }
    })
  }

  return (
    <div className="w-full mt-14">
      <div className="w-full mb-6">
        <div className="w-full flex items-center gap-3">
          <h3 className="text-xl font-semibold">Address</h3>
          <Button variant='outline' onClick={()=>setEdit(true)}>
            <Pencil/>
            <span>Edit</span>
          </Button>
        </div>
        <p className="text-neutral-500 text-xs lg:text-sm font-medium">Fill in your address to have it automatically applied at checkout, so you won&apos;t need to retype it.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col lg:flex-row lg:gap-5">
          <FormField<AddressFormType>
            label="Province"
            errors={errors}
            register={register}
            name="province"
            placeholder="enter your province"
            disable={!edit}
          />
          <FormField<AddressFormType>
            label="City"
            errors={errors}
            register={register}
            name="city"
            placeholder="enter your city"
            disable={!edit}
          />
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-5">
          <FormField<AddressFormType>
            label="District"
            errors={errors}
            register={register}
            name="district"
            placeholder="enter your district"
            disable={!edit}
          />
          <FormField<AddressFormType>
            label="Village"
            errors={errors}
            register={register}
            name="village"
            placeholder="enter your village"
            disable={!edit}
          />
        </div>
        <FormField<AddressFormType>
          label="Postal"
          errors={errors}
          register={register}
          name="postalCode"
          placeholder="enter your postal code"
          disable={!edit}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="address" className="text-sm font-medium">Address</label>
          <Textarea id="address" {...register('address')} className="border-black" placeholder="enter your address" disabled={!edit}/>
        </div>

        <div className="w-full flex justify-end mt-5">
          {edit && (
            <Button className="uppercase tracking-widest" type="submit" disabled={isLoading}>
              {isLoading ? <Loader className="h-4 w-4 animate-spin"/> : "Save"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
 
export default AddressForm;