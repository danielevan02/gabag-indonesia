"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/input/form-field";
import { createProduct } from "@/lib/actions/product.action";
import { useEdgeStore } from "@/lib/edge-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { productSchema } from "@/lib/schema";
import { UploadFn } from "@/components/upload/uploader-provider";
import { Loader, Plus } from "lucide-react";
import { generateFileName } from "@/lib/utils";
import { z } from "zod";
import VariantForm from "./variant-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type ProductFormType = z.infer<typeof productSchema>;

const ProductForm = ({
  subCategories,
}: {
  subCategories: { value: string; label: string }[];
}) => {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const [images, setImages] = useState<string[]>([]);
  const [triggerUpload, setTriggerUpload] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [hasVariant, setHasVariant] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    control,
    setValue,
  } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      hasVariant: false,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const handleVariantChange = (checked: boolean) => {
    setHasVariant(checked);
    setValue("hasVariant", checked);
  };

  const handleUpload: UploadFn = async ({ file, signal, onProgressChange }) => {
    const res = await edgestore.publicImages.upload({
      file,
      signal,
      onProgressChange,
      options: {
        manualFileName: generateFileName("product", getValues("name") || "", ".png"),
        temporary: true
      },
    });
    setImages((prev) => [...prev, res.url]);
    return { url: "" };
  };

  const onSubmit = async (data: ProductFormType) => {
    startTransition(async () => {
      try {
        const response = await createProduct({
          ...data,
          image: images,
          slug: data.name?.toLowerCase().replace(/ /g, "-"),
        });
        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/product");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  const addVariant = () => {
    append({
      name: "",
      price: 0,
      stock: 0,
      image: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errors) => console.log(errors))}
      className="space-y-4 mt-5"
    >
      <FormField
        label="Name"
        name="name"
        type="text"
        register={register}
        errors={errors}
        required
        placeholder="Enter product name"
        disabled={isLoading}
      />

      <FormField
        label="Sub Category"
        name="subCategory"
        type="select"
        control={control}
        errors={errors}
        required
        placeholder="Select sub-category"
        options={subCategories}
        disabled={isLoading}
      />

      <FormField
        label="Images"
        name="image"
        type="multi-image"
        uploadFn={handleUpload}
        triggerUpload={triggerUpload}
        errors={errors}
        required
        register={register}
        disabled={isLoading}
      />

      <FormField
        label="Discount"
        name="discount"
        type="number"
        register={register}
        errors={errors}
        placeholder="Enter discount percentage"
        disabled={isLoading}
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        register={register}
        errors={errors}
        required
        placeholder="Enter product description"
        disabled={isLoading}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasVariant"
          checked={hasVariant}
          onCheckedChange={handleVariantChange}
          disabled={isLoading}
        />
        <Label htmlFor="hasVariant">Has Variants</Label>
      </div>

      {!hasVariant && (
        <FormField
          label="Price"
          name="price"
          type="number"
          register={register}
          errors={errors}
          required
          placeholder="Enter product price"
          disabled={isLoading}
        />
      )}

      {hasVariant && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Variants</h3>
            <Button
              type="button"
              onClick={addVariant}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <VariantForm
                key={field.id}
                index={index}
                onRemove={remove}
                register={register}
                errors={errors}
                control={control}
                setValue={setValue}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          type="button"
          disabled={isLoading}
          onClick={() => router.push("/admin/catalog/product")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
