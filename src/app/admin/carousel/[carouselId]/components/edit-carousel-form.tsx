"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { carouselSchema } from "@/lib/schema";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RouterOutputs } from "@/trpc/routers/_app";
import { CarouselImageField } from "../../components/carousel-images-field";

export type CarouselFormType = z.infer<typeof carouselSchema>;

interface EditCarouselFormProps {
  carousel: RouterOutputs["carousel"]["getById"];
}

export default function EditCarouselForm({ carousel }: EditCarouselFormProps) {
  const router = useRouter();
  const { isPending, mutateAsync } = trpc.carousel.update.useMutation({
    onSuccess: (resp) => {
      if (resp.success) {
        toast.success(resp.message);
        router.push("/admin/carousel");
      } else {
        toast.error(resp.message);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      name: carousel.name,
      linkUrl: carousel.linkUrl,
      altText: carousel.altText || "",
      desktopImageId: carousel.desktopImageId,
      mobileImageId: carousel.mobileImageId,
      isActive: carousel.isActive,
      startDate: carousel.startDate ? new Date(carousel.startDate) : undefined,
      endDate: carousel.endDate ? new Date(carousel.endDate) : undefined,
    },
  });

  const onSubmit = async (data: CarouselFormType) => {
    try {
      await mutateAsync({
        id: carousel.id,
        ...data,
      });
    } catch (error) {
      toast.error("Internal Server Error");
      console.log(error);
    }
  };

  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3"
      >
        <FormInput
          form={form}
          fieldType="text"
          label="Name"
          name="name"
          type="text"
          placeholder="Enter carousel name"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Link URL"
          name="linkUrl"
          type="url"
          placeholder="https://example.com"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Alt Text (Optional)"
          name="altText"
          type="text"
          placeholder="Enter image alt text for accessibility"
          disabled={isPending}
        />

        <CarouselImageField
          form={form}
          fieldName="desktopImageId"
          allMediaFiles={allMediaFiles}
        />

        <CarouselImageField
          form={form}
          fieldName="mobileImageId"
          allMediaFiles={allMediaFiles}
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", !!checked)}
            disabled={isPending}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            form={form}
            fieldType="date"
            label="Start Date (Optional)"
            name="startDate"
            disabled={isPending}
          />
          <FormInput
            form={form}
            fieldType="date"
            label="End Date (Optional)"
            name="endDate"
            disabled={isPending}
          />
        </div>


        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isPending}
            onClick={() => router.push("/admin/carousel")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Update Carousel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
