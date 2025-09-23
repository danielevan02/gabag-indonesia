"use client";

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { subCategorySchema } from "@/lib/schema";
import { ImagePlus, Loader } from "lucide-react";
import { FormInput } from "@/components/shared/input/form-input";
import { Form } from "@/components/ui/form";
import z from "zod";
import { trpc } from "@/trpc/client";
import GalleryModal from "@/components/shared/gallery/gallery-modal";
import Image from "next/image";
import { Label } from "@/components/ui/label";

type SubCategoryFormType = z.infer<typeof subCategorySchema>;

const SubCategoryForm = ({
  categories,
  products,
}: {
  categories: { id: string; name: string }[];
  products: { id: string; name: string }[];
}) => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: '',
    }
  });

  const { mutateAsync, isPending } = trpc.subCategory.create.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/catalog/sub-category")
      }
    },
  });

  const mediaFileId = form.watch("mediaFileId");
  const { data: mediaFile } = trpc.gallery.getById.useQuery(
    { id: mediaFileId! },
    { enabled: !!mediaFileId }
  );
  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();


  const onSubmit = async (data: SubCategoryFormType) => {
    try {
      await mutateAsync(data);
    } catch (error) {
      console.log(error);
      toast.error("Can't create sub-category");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 mt-5">
        <Controller
          control={form.control}
          name="mediaFileId"
          render={({ field }) => (
            <div className="flex gap-2 flex-col mb-5">
              <Label>Sub-Category Photo</Label>
              <p className="text-xs text-neutral-600">NOTE: Select one image for the sub-category</p>
              <div className="flex flex-col gap-2">
                {field.value && mediaFile?.secure_url ? (
                  // SHOW THIS IF THERE IS IMAGE
                  <div className="w-full flex gap-2 justify-start flex-wrap">
                    <div className="size-32 overflow-hidden rounded-md border">
                      <Image
                        src={mediaFile.secure_url}
                        alt={`sub-category-image`}
                        width={100}
                        height={100}
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  // SHOW THIS IF THERE IS NO IMAGE
                  <div className="flex flex-col items-center justify-center size-44 rounded-md border bg-accent gap-4">
                    <ImagePlus />
                    <span className="text-sm text-neutral-700">Add sub-category image</span>
                  </div>
                )}

                <GalleryModal
                  multiple={false}
                  initialSelectedImages={mediaFile?.secure_url ? [mediaFile.secure_url] : []}
                  setInitialSelectedImages={(value) => {
                    // Find the mediaFile ID that corresponds to the selected secure_url
                    if (typeof value === "string" && value && allMediaFiles?.images) {
                      const selectedMediaFile = allMediaFiles.images.find(
                        (file) => file.secure_url === value
                      );
                      if (selectedMediaFile) {
                        field.onChange(selectedMediaFile.id);
                      }
                    } else {
                      field.onChange("");
                    }
                  }}
                />
              </div>
            </div>
          )}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Name"
          name="name"
          type="text"
          placeholder="Enter sub-category name"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="select"
          label="Category"
          name="category"
          placeholder="Select category"
          options={categories}
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Discount"
          name="discount"
          type="number"
          description="Note: If you applied a discount here will automatically update discounts for all related products and variants."
          placeholder="Enter discount"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="select"
          label="Products"
          name="products"
          isMulti
          placeholder="Select products"
          options={products}
          disabled={isPending}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isPending}
            onClick={() => router.push("/admin/catalog/sub-category")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Create Sub-Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SubCategoryForm;
