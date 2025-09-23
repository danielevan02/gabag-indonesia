"use client";

import GalleryModal from "@/components/shared/gallery/gallery-modal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Controller,
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { productSchema } from "@/lib/schema";
import { FormInput } from "@/components/shared/input/form-input";
import { trpc } from "@/trpc/client";
import { Label } from "@/components/ui/label";

type ProductSchema = z.infer<typeof productSchema>;
type VariantFormProps = ProductSchema;

export default function VariantForm({
  fieldLength,
  index,
  remove,
  form,
}: {
  form: UseFormReturn<VariantFormProps>;
  remove: UseFieldArrayRemove;
  index: number;
  fieldLength: number;
}) {
  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();

  // Get the variant image ID
  const variantImageId = form.watch(`variants.${index}.image`);
  const { data: variantImage } = trpc.gallery.getById.useQuery(
    { id: variantImageId! },
    { enabled: !!variantImageId }
  );

  return (
    <div className="relative rounded-md shadow p-8 bg-white flex flex-col gap-3">
      <Controller
        control={form.control}
        name={`variants.${index}.image`}
        render={({ field }) => (
          <div className="flex flex-col gap-2 mb-5">
            <Label>Variant Image</Label>
            <p className="text-xs text-neutral-600">NOTE: Select one image for this variant</p>
            <div className="flex items-center justify-start gap-2">
              {field.value && variantImage?.secure_url ? (
                <div className="size-36 overflow-hidden rounded-md border">
                  <Image
                    src={variantImage.secure_url}
                    alt="Variant Image"
                    width={100}
                    height={100}
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="size-36 bg-accent border gap-3 text-xs rounded-md flex flex-col items-center justify-center p-5">
                  <Plus />
                  Add Image
                </div>
              )}
              <GalleryModal
                multiple={false}
                initialSelectedImages={variantImage?.secure_url ? [variantImage.secure_url] : []}
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
        label="Variant Name"
        name={`variants.${index}.name`}
        placeholder="Insert variant name..."
      />
      <FormInput
        fieldType="text"
        form={form}
        label="SKU"
        name={`variants.${index}.sku`}
        placeholder="Insert SKU number..."
      />
      <FormInput
        fieldType="text"
        form={form}
        label="Price"
        type="number"
        name={`variants.${index}.regularPrice`}
        placeholder="Insert variant price..."
      />
      <FormInput
        form={form}
        fieldType="text"
        label="Discount"
        type="number"
        name={`variants.${index}.discount`}
        placeholder="Insert discount..."
      />
      <FormInput
        form={form}
        fieldType="text"
        label="Stock"
        type="number"
        name={`variants.${index}.stock`}
        placeholder="Insert variant stock..."
      />

      {fieldLength > 1 && (
        <Button
          onClick={() => remove(index)}
          variant="destructive"
          className="absolute top-2 right-2"
        >
          <X />
        </Button>
      )}
    </div>
  );
}
