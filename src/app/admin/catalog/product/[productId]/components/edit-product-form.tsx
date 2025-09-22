"use client";

import { Button } from "@/components/ui/button";
import { productSchema } from "@/lib/schema";
import { ImagePlus, Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VariantForm from "../../variant-form";
import { FormInput } from "@/components/shared/input/form-input";
import { Form } from "@/components/ui/form";
import { trpc } from "@/trpc/client";
import { RouterOutputs } from "@/trpc/routers/_app";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import GalleryModal from "@/components/shared/gallery/gallery-modal";
type Product = RouterOutputs["product"]["getByIdWithSubCategories"];

type ProductFormType = z.infer<typeof productSchema>;

// Component to display product image by ID
const ProductImageDisplay = ({ imageId, alt }: { imageId: string; alt: string }) => {
  const { data: mediaFile } = trpc.gallery.getById.useQuery(
    { id: imageId },
    { enabled: !!imageId }
  );

  if (!mediaFile?.secure_url) {
    return (
      <div className="size-32 flex items-center justify-center rounded-md border bg-gray-100">
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="size-32 overflow-hidden rounded-md border">
      <Image
        src={mediaFile.secure_url}
        alt={alt}
        width={100}
        height={100}
        className="size-full object-cover"
      />
    </div>
  );
};

const EditProductForm = ({ data }: { data: Product }) => {
  const router = useRouter();
  const [hasVariant, setHasVariant] = useState(data.hasVariant ?? false);
  const utils = trpc.useUtils();

  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      sku: data.sku || "",
      name: data.name,
      subCategory: data.subCategory,
      price: data.regularPrice,
      discount: data.discount || undefined,
      description: data.description,
      stock: data.stock,
      images: data.images || [],
      hasVariant: hasVariant,
      weight: data.weight,
      height: data.height,
      length: data.length,
      width: data.width,
      variants: data.variants || [],
    },
  });

  const updateProduct = trpc.product.update.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
        utils.product.getAll.invalidate();
        router.push("/admin/catalog/product");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to update product");
      console.error("Error updating product:", error);
    },
  });

  useEffect(() => {
    if (hasVariant) {
      form.reset({
        hasVariant,
        variants:
          data.variants?.length !== 0
            ? data.variants
            : [
                {
                  discount: undefined,
                  image: "",
                  name: "",
                  regularPrice: undefined,
                  sku: "",
                  stock: undefined,
                },
              ],
      });
    } else {
      form.reset({
        hasVariant,
        variants: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVariant]);

  const { append, remove, fields } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const onSubmit = async (result: ProductFormType) => {
    console.log(result)
    try {
      updateProduct.mutate({
        ...result,
        id: data.id,
      });
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Please check your input data");
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
          fieldType="text"
          form={form}
          label="Name"
          name="name"
          placeholder="Please enter product name"
          disabled={updateProduct.isPending}
        />

        <FormInput
          fieldType="select"
          form={form}
          label="Select Sub Category"
          name="subCategory"
          placeholder="Please choose the sub category"
          options={data.allSubCategory}
          disabled={updateProduct.isPending}
        />
  
        <Controller
          control={form.control}
          name="images"
          render={({ field }) => (
            <div className="flex gap-2 flex-col mb-5">
              <Label>Product Photo(s)</Label>
              <p className="text-xs text-neutral-600">NOTE: You can add more than 1 image</p>
              <div className="flex flex-col gap-2">
                {field.value && field.value?.length !== 0 ? (
                  // SHOW THIS IF THERE IS IMAGES
                  <div className="w-full flex gap-2 justify-start flex-wrap">
                    {field.value?.map((imageId, index) => (
                      <ProductImageDisplay key={index} imageId={imageId} alt={`product-image-${index}`} />
                    ))}
                  </div>
                ) : (
                  // SHOW THIS IF THERE IS NO IMAGES
                  <div className="flex flex-col items-center justify-center size-44 rounded-md border bg-accent gap-4">
                    <ImagePlus />
                    <span className="text-sm text-neutral-700">Add product images</span>
                  </div>
                )}

                <GalleryModal
                  multiple={true}
                  initialSelectedImages={
                    field.value && allMediaFiles?.images
                      ? field.value
                          .map(id => allMediaFiles.images.find(file => file.id === id)?.secure_url)
                          .filter(Boolean) as string[]
                      : []
                  }
                  setInitialSelectedImages={(value) => {
                    if (Array.isArray(value) && allMediaFiles?.images) {
                      const imageIds = value.map(url => {
                        const mediaFile = allMediaFiles.images.find(file => file.secure_url === url);
                        return mediaFile?.id;
                      }).filter(Boolean) as string[];
                      field.onChange(imageIds);
                    } else {
                      field.onChange([]);
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
          label="Discount (optional)"
          description="If this product has variants, the discount will automatically apply to all of them."
          name="discount"
          type="number"
          placeholder="Please input the discount"
          disabled={updateProduct.isPending}
        />

        <div className="flex flex-col gap-2 mb-5">
          <Label className="text-base">Has Variants?</Label>
          <div className="flex gap-2 items-center">
            <Label className="text-base text-neutral-600">No</Label>
            <Switch checked={hasVariant} onCheckedChange={(e) => setHasVariant(e)} />
            <Label className="text-base text-neutral-600">Yes</Label>
          </div>
        </div>

        {hasVariant ? (
          <div className="bg-neutral-100 p-3 rounded-md">
            <Label className="text-lg mb-5">Variants</Label>
            <div className="flex flex-col gap-3 overflow-y-scroll max-h-[80vh]">
              {fields.map((field, index) => (
                <VariantForm
                  form={form}
                  key={field.id}
                  remove={remove}
                  index={index}
                  fieldLength={fields.length}
                />
              ))}
            </div>
            <Button
              className="mt-5 w-full"
              onClick={() =>
                append({
                  image: "",
                  name: "",
                  regularPrice: 0,
                  stock: 0,
                  discount: undefined,
                  sku: "",
                })
              }
            >
              Add Variant <Plus />
            </Button>
          </div>
        ) : (
          <>
            <FormInput
              fieldType="text"
              form={form}
              label="Price"
              name="price"
              type="number"
              disabled={updateProduct.isPending}
              placeholder="Please enter product price"
            />

            <FormInput
              fieldType="text"
              form={form}
              label="Stock"
              name="stock"
              type="number"
              disabled={updateProduct.isPending}
              placeholder="Please input the stock"
            />
          </>
        )}

        <FormInput
          form={form}
          fieldType="text"
          label="Weight (grams)"
          name="weight"
          type="number"
          placeholder="Please enter product weight"
          disabled={updateProduct.isPending}
        />

        <div className="flex gap-2 items-center">
          <FormInput
            form={form}
            fieldType="text"
            label="Length (cm)"
            name="length"
            type="number"
            placeholder="Please enter product length"
            disabled={updateProduct.isPending}
          />{" "}
          x
          <FormInput
            fieldType="text"
            form={form}
            label="Width (cm)"
            name="width"
            type="number"
            placeholder="Please enter product weight"
            disabled={updateProduct.isPending}
          />{" "}
          x
          <FormInput
            form={form}
            fieldType="text"
            label="Height (cm)"
            name="height"
            type="number"
            placeholder="Please enter product height"
            disabled={updateProduct.isPending}
          />
        </div>

        <FormInput
          form={form}
          fieldType="textarea"
          label="Description"
          name="description"
          disabled={updateProduct.isPending}
          placeholder="Please enter product description"
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            onClick={() => router.back()}
            disabled={updateProduct.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateProduct.isPending}>
            {updateProduct.isPending ? <Loader className="size-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProductForm;
