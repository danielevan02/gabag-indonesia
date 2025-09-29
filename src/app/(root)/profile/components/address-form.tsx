"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { addressSchema } from "@/lib/schema";
import { trpc } from "@/trpc/client";
import { Address } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type AddressFormType = z.infer<typeof addressSchema>;

const AddressForm = ({ address, id }: { address?: Address; id: string }) => {
  const [edit, setEdit] = useState(false);
  const { mutateAsync: updateAddress, isPending: isLoading } = trpc.auth.updateAddress.useMutation({
    onSuccess: (res) => {
      if (res?.success) {
        toast.success(res.message as string);
        setEdit(false);
      } else {
        toast.error(res?.message as string);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: address?.province || "",
      city: address?.city || "",
      district: address?.district || "",
      village: address?.village || "",
      postalCode: address?.postalCode || "",
      address: address?.address || "",
    },
  });

  const onSubmit = async (data: AddressFormType) => {
    console.log(data)
    await updateAddress({ ...data, id });
  };

  return (
    <div className="w-full mt-14">
      <div className="w-full mb-6">
        <div className="w-full flex items-center gap-3">
          <h3 className="text-xl font-semibold">Address</h3>
          <Button variant="outline" onClick={() => setEdit(true)}>
            <Pencil />
            <span>Edit</span>
          </Button>
        </div>
        <p className="text-neutral-500 text-xs lg:text-sm font-medium">
          Fill in your address to have it automatically applied at checkout, so you won&apos;t need
          to re-type it.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:gap-5">
            <FormInput
              form={form}
              fieldType="text"
              label="Province"
              name="province"
              placeholder="enter your province"
              disabled={!edit}
            />
            <FormInput
              form={form}
              fieldType="text"
              label="City"
              name="city"
              placeholder="enter your city"
              disabled={!edit}
            />
          </div>
          <div className="flex flex-col lg:flex-row lg:gap-5">
            <FormInput
              form={form}
              fieldType="text"
              label="District"
              name="district"
              placeholder="enter your district"
              disabled={!edit}
            />
            <FormInput
              form={form}
              fieldType="text"
              label="Village"
              name="village"
              placeholder="enter your village"
              disabled={!edit}
            />
          </div>
          <FormInput
            form={form}
            fieldType="text"
            label="Postal"
            name="postalCode"
            placeholder="enter your postal code"
            disabled={!edit}
          />
          <FormInput
            form={form}
            fieldType="textarea"
            label="Address"
            name="address"
            placeholder="enter your address"
            disabled={!edit}
          />

          <div className="w-full flex justify-end">
            {edit && (
              <Button className="uppercase tracking-widest" type="submit" disabled={isLoading}>
                {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddressForm;
