"use client";

import { Button } from "@/components/ui/button";
import slugify from 'react-slugify'
import { ErrorMessage, FormField } from "@/components/shared/input/form-field";
import { createProduct } from "@/lib/actions/product.action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray, SubmitErrorHandler, Controller, get } from "react-hook-form";
import { toast } from "sonner";
import { productSchema } from "@/lib/schema";
import { ImagePlus, Loader, Plus } from "lucide-react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import GalleryModal from "@/components/gallery/gallery-modal";
import VariantForm from "../../variant-form";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

export type ProductFormType = z.infer<typeof productSchema>;

const ProductForm = ({
  subCategories,
}: {
  subCategories: { value: string; label: string }[];
}) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [hasVariant, setHasVariant] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProductFormType>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      hasVariant: hasVariant,
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
      if(hasVariant){
        reset({
          hasVariant,
          variants: [{
            discount: undefined,
            image: '',
            name: '',
            regularPrice: undefined,
            sku: '',
            stock: undefined
          }]
        })
      } else {
        reset({
          hasVariant,
          variants: []
        })
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasVariant])

  const onSubmit = async (data: ProductFormType) => {
    startTransition(async () => {
      try {
        const response = await createProduct({
          ...data,
          slug: slugify(data.name),
        });
        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/product");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to create product");
      }
    });
  };

  const onError: SubmitErrorHandler<ProductFormType> = (error) => {
    console.log(error);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
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

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <div className="flex gap-2 flex-col mb-5">
            <Label>Product Photo(s)</Label>
            <p className="text-xs text-neutral-600">NOTE: You can add more than 1 image</p>
            <div className="flex flex-col gap-2">
              {field.value && field.value?.length !== 0 ? (
                // SHOW THIS IF THERE IS IMAGES
                <div className="w-full flex gap-2 justify-start flex-wrap">
                  {field.value?.map((image, index) => (
                    <div key={index} className="size-32 overflow-hidden rounded-md border">
                      <Image
                        
                        src={image}
                        alt={`image-product`}
                        width={300}
                        height={300}
                        className="size-full object-cover"
                      />
                    </div>
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
                initialSelectedImages={field.value ? field.value:[]}
                setInitialSelectedImages={field.onChange}
                multiple
              />

              {get(errors, "image") && <ErrorMessage message={get(errors, "image.message")}/>}
            </div>
          </div>
        )}
      />

      <FormField
        label="Discount (optional)"
        description="If this product has variants, the discount will automatically apply to all of them."
        name="discount"
        type="number"
        register={register}
        errors={errors}
        placeholder="Enter discount percentage"
        disabled={isLoading}
      />

      <div className="flex flex-col gap-2 mb-5">
        <Label className="text-base">Has Variants?</Label>
        <div className="flex gap-2 items-center">
          <Label className="text-base text-neutral-600">No</Label>
          <Switch checked={hasVariant} onCheckedChange={(e) => setHasVariant(e)} disabled={isLoading} />
          <Label className="text-base text-neutral-600">Yes</Label>
        </div>
      </div>

      {hasVariant ? (
        <div className="bg-neutral-100 p-3 rounded-md">
          <Label className="text-lg mb-5">Variants</Label>
          <div className="flex flex-col gap-3 overflow-y-scroll max-h-[80vh]">
            {fields.map((field, index) => (
              <VariantForm
                control={control}
                key={field.id}
                remove={remove}
                errors={errors}
                index={index}
                register={register}
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
          <FormField
            label="Price"
            name="price"
            type="number"
            placeholder="Please enter product price"
            register={register}
            errors={errors}
            disabled={isLoading}
            required
          />

          <FormField
            label="Stock"
            name="stock"
            type="number"
            placeholder="Please input the stock"
            errors={errors}
            register={register}
            disabled={isLoading}
          />
        </>
      )}

      <FormField
        label="Description"
        name="description"
        type="textarea"
        placeholder="Please enter product description"
        register={register}
        errors={errors}
        disabled={isLoading}
        required
      />

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
