"use client";

import { ErrorMessage, FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { updateProduct } from "@/lib/actions/product.action";
import { productSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, get, SubmitErrorHandler, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductFormType } from "../../add/components/product-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Variant } from "@/types";
import VariantForm from "../../variant-form";
import GalleryModal from "@/components/gallery/gallery-modal";
import Image from "next/image";

export interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    subCategory: {
      value: string;
      label: string;
    } | null;
    image: string[];
    price: number;
    discount: number;
    description: string;
    stock: number;
    hasVariant: boolean;
    variants: Variant[];
  };
  subCategoryList: {
    value: string;
    label: string;
  }[];
}

const EditProductForm = ({ product, subCategoryList }: EditProductFormProps) => {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [hasVariant, setHasVariant] = useState(product.hasVariant);

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      subCategory: product.subCategory,
      price: product.price,
      discount: product.discount,
      description: product.description,
      stock: product.stock,
      image: product.image,
      hasVariant: hasVariant,
      variants: product.variants || []
    },
  });

  useEffect(() => {
    if(hasVariant){
      reset({
        hasVariant,
        variants: product.variants.length !== 0 ? product.variants : [{
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
  
  const { append, remove, fields } = useFieldArray({
    control,
    name: "variants",
  });

  const onSubmit = async (data: ProductFormType) => {
    startTransition(async () => {
      try {
        const response = await updateProduct({
          ...data,
          id: product.id,
        });

        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/product");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error updating product:", error);
        toast.error("Failed to update product");
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
        placeholder="Please enter product name"
        register={register}
        errors={errors}
        disabled={isLoading}
        required
      />
      <FormField
        label="Select Sub Category"
        name="subCategory"
        placeholder="Please choose the sub category"
        type="select"
        errors={errors}
        options={subCategoryList}
        control={control}
        disabled={isLoading}
        required
      />

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <div className="flex gap-2 flex-col mb-5">
            <Label>Product Photo(s)</Label>
            <p className="text-xs text-neutral-600">NOTE: You can add more than 1 image</p>
            <div className="flex flex-col gap-2">
              {field.value?.length !== 0 ? (
                // SHOW THIS IF THERE IS IMAGES
                <div className="w-full flex gap-2 justify-start flex-wrap">
                  {field.value?.map((image, index) => (
                    <div key={index} className="size-32 overflow-hidden rounded-md border">
                      <Image
                        
                        src={image}
                        alt={`image-product`}
                        width={100}
                        height={100}
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
        placeholder="Please input the discount"
        errors={errors}
        register={register}
        disabled={isLoading}
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
            disabled={isLoading}
            placeholder="Please enter product price"
            register={register}
            errors={errors}
            required
          />

          <FormField
            label="Stock"
            name="stock"
            type="number"
            disabled={isLoading}
            placeholder="Please input the stock"
            errors={errors}
            register={register}
          />
        </>
      )}

      <FormField
        label="Description"
        name="description"
        type="textarea"
        disabled={isLoading}
        placeholder="Please enter product description"
        register={register}
        errors={errors}
        required
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader className="size-4 animate-spin" /> : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
