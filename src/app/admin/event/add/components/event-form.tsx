"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { eventSchema } from "@/lib/schema";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export type EventFormType = z.infer<typeof eventSchema>;

export default function EventForm({
  products,
}: {
  products: {
    id: string;
    name: string;
  }[];
}) {
  const router = useRouter();
  const {isPending, mutateAsync} = trpc.event.create.useMutation({
    onSuccess: (resp) => {
      if (resp.success) {
          toast.success(resp.message);
          router.push("/admin/event");
        } else {
          toast.error(resp.message);
        }
    }
  })

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      discount: undefined,
      name: "",
    },
  });

  const onSubmit = async (data: EventFormType) => {
      try {
        await mutateAsync(data)
      } catch (error) {
        toast.error("Internal Server Error");
        console.log(error);
      }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
      >
        <FormInput
          form={form}
          fieldType="text"
          label="Name"
          name="name"
          type="text"
          placeholder="Enter product name"
          disabled={isPending}
        />

        <FormInput
          fieldType="select"
          form={form}
          label="Products"
          name="products"
          placeholder="Select product"
          isMulti
          options={products}
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Discount"
          name="discount"
          type="number"
          placeholder="Enter discount"
          disabled={isPending}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isPending}
            onClick={() => router.push("/admin/event")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
