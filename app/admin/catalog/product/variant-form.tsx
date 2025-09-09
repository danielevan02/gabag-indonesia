"use client";

import GalleryModal from "@/components/gallery/gallery-modal";
import BlurImage from "@/components/shared/blur-image";
import { ErrorMessage, FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Control,
  Controller,
  FieldErrors,
  get,
  UseFieldArrayRemove,
  UseFormRegister,
} from "react-hook-form";

// This type is for helping so i dont get ts error, because the useform type is generic
type VariantFormProps = {
  subCategory: {
    value: string;
    label: string;
  } | null;
  hasVariant: boolean;
  name?: string | undefined;
  price?: number | undefined;
  discount?: number | undefined;
  description?: string | undefined;
  stock?: number | undefined;
  image?: string[] | undefined;
  variants?:
    | {
        name: string;
        regularPrice: number;
        stock: number;
        image: string;
        discount?: number | undefined;
        sku?: string | undefined;
      }[]
    | undefined;
  slug?: string | undefined;
};

export default function VariantForm({
  fieldLength,
  index,
  errors,
  register,
  remove,
  control,
}: {
  control: Control<VariantFormProps>;
  remove: UseFieldArrayRemove;
  register: UseFormRegister<VariantFormProps>;
  errors: FieldErrors<VariantFormProps>;
  index: number;
  fieldLength: number;
}) {

  return (
    <div className="relative rounded-md shadow p-8 bg-white">
      <Controller
        control={control}
        name={`variants.${index}.image`}
        render={({ field }) => (
          <div className="flex flex-col gap-2 mb-5">
            <div className="flex items-center justify-start gap-2">
              {field.value ? (
                <div className="size-36 overflow-hidden rounded-md border">
                  <BlurImage
                    src={field.value}
                    alt="Variant Image"
                    width={100}
                    height={100}
                    className="size-full object-cover"
                    dynamic
                  />
                </div>
              ) : (
                <div className="size-36 bg-accent border gap-3 text-xs rounded-md flex flex-col items-center justify-center p-5">
                  <Plus />
                  Add Image
                </div>
              )}
              <GalleryModal
                initialSelectedImages={field.value ? [field.value] : []}
                setInitialSelectedImages={field.onChange}
              />
            </div>
            {get(errors, `variants.${index}.image`) && <ErrorMessage message={get(errors, `variants.${index}.image.message`)} />}
          </div>
        )}
      />
      <FormField
        label="Variant Name"
        name={`variants.${index}.name`}
        placeholder="Insert variant name..."
        register={register}
        errors={errors}
        required
      />
      <FormField
        label="SKU"
        name={`variants.${index}.sku`}
        placeholder="Insert SKU number..."
        register={register}
        errors={errors}
      />
      <FormField
        label="Price"
        type="number"
        name={`variants.${index}.regularPrice`}
        placeholder="Insert variant price..."
        register={register}
        errors={errors}
      />
      <FormField
        label="Discount"
        type="number"
        name={`variants.${index}.discount`}
        placeholder="Insert discount..."
        register={register}
        errors={errors}
      />
      <FormField
        label="Stock"
        type="number"
        name={`variants.${index}.stock`}
        placeholder="Insert variant stock..."
        register={register}
        errors={errors}
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
