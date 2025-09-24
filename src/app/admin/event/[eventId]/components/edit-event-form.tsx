"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { eventSchema } from "@/lib/schema";
import { trpc } from "@/trpc/client";
import { RouterOutputs } from "@/trpc/routers/_app";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export type EventFormType = z.infer<typeof eventSchema>;

type EventData = RouterOutputs['event']['getById']

export default function EditEventForm({
  event,
  products,
}: {
  event: EventData;
  products: {
    id: string;
    name: string;
  }[];
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { isPending, mutateAsync } = trpc.event.update.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        utils.event.getAll.invalidate();
        router.push("/admin/event");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to update event");
      console.error(error);
    },
  });

  const form = useForm<EventFormType>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.name,
      discount: event.discount || undefined,
      products: event.products.map((product) => product.id)
    },
  });

  const onSubmit = async (data: EventFormType) => {
    try {
      await mutateAsync({ ...data, id: event.id });
    } catch (error) {
      console.error(error);
    }
  };

  const onError = (error: any) => {
    console.log(error)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3"
      >
        <FormInput
          form={form}
          fieldType="text"
          label="Name"
          name="name"
          type="text"
          placeholder="Enter event name"
          disabled={isPending}
        />

        <FormInput
          fieldType="select"
          form={form}
          label="Products"
          name="products"
          placeholder="Select products"
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
          placeholder="Enter discount percentage (0-100)"
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
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Update Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}