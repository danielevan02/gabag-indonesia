"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  UseFieldArrayRemove,
  UseFormReturn,
} from "react-hook-form";
import { z } from "zod";
import { productSchema } from "@/lib/schema";
import { FormInput } from "@/components/shared/input/form-input";
import { trpc } from "@/trpc/client";
import { VariantImageField } from "./variant-image-field";

type ProductSchema = z.infer<typeof productSchema>;
export type VariantFormProps = ProductSchema;

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

  return (
    <div className="relative rounded-md shadow p-8 bg-white flex flex-col gap-3">
      <VariantImageField
        form={form}
        fieldName={`variants.${index}.image`}
        allMediaFiles={allMediaFiles}
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
