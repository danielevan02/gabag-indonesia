"use client";

import { categorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput } from "@/components/shared/input/form-input";
import { Form } from "@/components/ui/form";
import { trpc } from "@/trpc/client";

export type CategoryFormType = z.infer<typeof categorySchema>;

export default function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.category.update.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        utils.category.getAll.invalidate();
        router.push("/admin/catalog/category");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to update category");
      console.error(error);
    },
  });

  const form = useForm<CategoryFormType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      image: category.image,
      name: category.name,
    },
  });


  const onSubmit = async (data: CategoryFormType) => {
    try {
      await mutateAsync({ ...data, id: category.id });
    } catch (error) {
      console.error(error)
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
          placeholder="Please enter category name"
          disabled={isPending}
        />

        {/* <Controller
          control={form.control}
          name="image"
          render={({ field }) => (
            <div className="flex gap-2 flex-col mb-5">
              <Label>Category Photo</Label>
              <div className="flex flex-col gap-2">
                {field.value ? (
                  // SHOW THIS IF THERE IS IMAGES
                  <div className="w-full flex gap-2 justify-start flex-wrap">
                    <div className="w-96 overflow-hidden rounded-md border">
                      <Image
                        src={field.value || "/images/placeholder-product.png"}
                        alt="category-image"
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
                    <span className="text-sm text-neutral-700">Add Category Image</span>
                  </div>
                )}

                <GalleryModal
                  initialSelectedImages={field.value ? [field.value] : []}
                  setInitialSelectedImages={field.onChange}
                />

                {form.formState.errors.image && (
                  <ErrorMessage message={form.formState.errors.image.message || "Invalid image"} />
                )}
              </div>
            </div>
          )}
        /> */}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {isPending ? "Updating..." : "Update Category"}
          </button>
        </div>
      </form>
    </Form>
  );
}
