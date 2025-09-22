"use client";

import { Button } from "@/components/ui/button";
import { subCategorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Image from "next/image";
// import {GalleryModal} from "@/components/gallery/gallery-modal";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";
import { RouterOutputs } from "@/trpc/routers/_app";
import z from "zod";
import GalleryModal from "@/components/shared/gallery/gallery-modal";

interface EditSubCategoryFormProps {
  subCategory: RouterOutputs["subCategory"]["getById"];
  categoryList: {
    id: string;
    name: string;
  }[];
}

type SubCategoryFormType = z.infer<typeof subCategorySchema>;

const EditSubCategoryForm = ({ subCategory, categoryList }: EditSubCategoryFormProps) => {
  const router = useRouter();
  const { mutateAsync, isPending } = trpc.subCategory.update.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        router.push("/admin/catalog/sub-category");
      } else {
        toast.error(response.message);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: subCategory?.name,
      category: subCategory?.category,
      products: subCategory?.products,
      discount: subCategory?.discount,
      mediaFileId: subCategory?.mediaFileId,
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
      await mutateAsync({ ...data, id: subCategory?.id });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3"
      >
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
          fieldType="text"
          form={form}
          label="Name"
          name="name"
          placeholder="Please enter sub category name"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="select"
          label="Select Category"
          name="category"
          placeholder="Please choose the main category"
          options={categoryList}
          disabled={isPending}
        />

        <FormInput
          fieldType="select"
          form={form}
          label="Select Products"
          name="products"
          placeholder="Please choose the products"
          isMulti
          options={subCategory?.products}
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Discount (optional)"
          name="discount"
          placeholder="Please input the discount"
          type="number"
          disabled={isPending}
        />

        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditSubCategoryForm;
