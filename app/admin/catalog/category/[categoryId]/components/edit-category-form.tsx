'use client'

import GalleryModal from "@/components/gallery/gallery-modal";
import { ErrorMessage, FormField } from "@/components/shared/input/form-field";
import { Label } from "@/components/ui/label";
import { updateCategory } from "@/lib/actions/category.action";
import { categorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@prisma/client";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, get, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export type CategoryFormType = z.infer<typeof categorySchema>;

export default function EditCategoryForm({ category }: { category: Category }) {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
  } = useForm<CategoryFormType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      image: category.image,
      name: category.name,
    },
  });

  const onSubmit = async (data: CategoryFormType) => {
    startTransition(async () => {
      try {
        const response = await updateCategory({ ...data, id: category.id });
        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/sub-category");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.log(error);
      }
    });
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
    >
      <FormField
        label="Name"
        name="name"
        placeholder="Please enter product name"
        register={register}
        errors={errors}
        disabled={isLoading}
        required
      />

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <div className="flex gap-2 flex-col mb-5">
            <Label>Sub-Category Photo(s)</Label>
            <div className="flex flex-col gap-2">
              {field.value?.length !== 0 ? (
                // SHOW THIS IF THERE IS IMAGES
                <div className="w-full flex gap-2 justify-start flex-wrap">
                  <div className="w-96 overflow-hidden rounded-md border">
                    <Image
                      src={field.value || "/images/placeholder-product.png"}
                      alt="subcategory-image"
                      width={100}
                      height={100}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                // SHOW THIS IF THERE IS NO IMAGES
                <div className="flex flex-col items-center justify-center size-44 rounded-md border bg-accent gap-4">
                  <ImagePlus />
                  <span className="text-sm text-neutral-700">Add Sub-category Images</span>
                </div>
              )}

              <GalleryModal
                initialSelectedImages={field.value ? [field.value] : []}
                setInitialSelectedImages={field.onChange}
              />

              {get(errors, "image") && <ErrorMessage message={get(errors, "image.message")} />}
            </div>
          </div>
        )}
      />
    </form>
  );
}
