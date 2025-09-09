"use client";

import { ProductFormType } from "@/app/admin/catalog/product/add/components/product-form";
import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { createEvents } from "@/lib/actions/event.action";
import { eventSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export type EventFormType = z.infer<typeof eventSchema>;

export default function EventForm({
  products,
}: {
  products: {
    value: string;
    label: string;
  }[];
}) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<EventFormType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      discount: undefined,
      name: "",
    },
  });

  const onSubmit = async (data: EventFormType) => {
    startTransition(async () => {
      try {
        const resp = await createEvents(data)
        if(resp.status === 200){
          toast.success(resp.message)
          router.push('/admin/event')
        } else {
          toast.error(resp.message)
        }
      } catch (error) {
        toast.error("Internal Server Error")
        console.log(error)
      }
    });
  };

  const onError: SubmitErrorHandler<ProductFormType> = (error) => {
    console.log(error);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
    >
      <FormField
        label="Name"
        name="name"
        type="text"
        register={register}
        errors={errors}
        required
        placeholder="Enter product name"
        disabled={isLoading}
      />

      <FormField
        label="Products"
        name="products"
        type="select"
        control={control}
        errors={errors}
        required
        placeholder="Select product"
        isMulti
        options={products}
        disabled={isLoading}
      />

      <FormField
        label="Discount"
        name="discount"
        type="number"
        register={register}
        errors={errors}
        placeholder="Enter discount"
        disabled={isLoading}
      />


      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          type="button"
          disabled={isLoading}
          onClick={() => router.push("/admin/event")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
