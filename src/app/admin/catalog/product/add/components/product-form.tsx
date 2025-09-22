"use client";

import { Button } from "@/components/ui/button";
import slugify from "react-slugify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast } from "sonner";
import { productSchema } from "@/lib/schema";
import { ImagePlus, Loader, Plus } from "lucide-react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import VariantForm from "../../variant-form";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";
import { trpc } from "@/trpc/client";
import GalleryModal from "@/components/shared/gallery/gallery-modal";

export type ProductFormType = z.infer<typeof productSchema>;

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

const ProductForm = ({ subCategories }: { subCategories: { id: string; name: string }[] }) => {
  const router = useRouter();
  const [hasVariant, setHasVariant] = useState(false);
  
  const { mutateAsync, isPending } = trpc.product.create.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        router.push("/admin/catalog/product");
      } else {
        toast.error(response.message);
      }
    },
  });

  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      hasVariant: hasVariant,
      variants: [],
      images: [],
      name: "",
      description: "",
      price: 0,
      weight: 0,
      height: 0,
      length: 0,
      width: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });


  useEffect(() => {
    const currentValues = form.getValues();
    if (hasVariant) {
      form.reset({
        ...currentValues,
        hasVariant,
        variants: [
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
        ...currentValues,
        hasVariant,
        variants: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVariant]);

  const onSubmit = async (data: ProductFormType) => {
    console.log('Form data:', data);
    console.log('Images:', data.images);
    try {
      await mutateAsync({
        ...data,
        slug: slugify(data.name),
      });
    } catch (error) {
      console.log("INI ERRORNYA",error);
      toast.error("Failed to create product");
    }
  };

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
          placeholder="Enter product name"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="select"
          label="Sub Category"
          name="subCategory"
          placeholder="Select sub-category"
          options={subCategories}
          disabled={isPending}
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
          form={form}
          fieldType="text"
          label="Discount (optional)"
          description="If this product has variants, the discount will automatically apply to all of them."
          name="discount"
          type="number"
          placeholder="Enter discount percentage"
          disabled={isPending}
        />

        <div className="flex flex-col gap-2 mb-5">
          <Label className="text-base">Has Variants?</Label>
          <div className="flex gap-2 items-center">
            <Label className="text-base text-neutral-600">No</Label>
            <Switch
              checked={hasVariant}
              onCheckedChange={(e) => setHasVariant(e)}
              disabled={isPending}
            />
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
              form={form}
              fieldType="text"
              label="Price"
              name="price"
              type="number"
              placeholder="Please enter product price"
              disabled={isPending}
            />

            <FormInput
              form={form}
              fieldType="text"
              label="SKU"
              name="sku"
              type="text"
              placeholder="Please enter product price"
              disabled={isPending}
            />

            <FormInput
              form={form}
              fieldType="text"
              label="Stock"
              name="stock"
              type="number"
              placeholder="Please input the stock"
              disabled={isPending}
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
          disabled={isPending}
        />

        <div className="flex gap-2 items-center">
          <FormInput
            form={form}
            fieldType="text"
            label="Length (cm)"
            name="length"
            type="number"
            placeholder="Please enter product length"
            disabled={isPending}
          />{" "}
          x
          <FormInput
            form={form}
            fieldType="text"
            label="Width (cm)"
            name="width"
            type="number"
            placeholder="Please enter product weight"
            disabled={isPending}
          />{" "}
          x
          <FormInput
            form={form}
            fieldType="text"
            label="Height (cm)"
            name="height"
            type="number"
            placeholder="Please enter product height"
            disabled={isPending}
          />
        </div>
        <FormInput
          form={form}
          fieldType="textarea"
          label="Description"
          name="description"
          placeholder="Please enter product description"
          disabled={isPending}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isPending}
            onClick={() => router.push("/admin/catalog/product")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
