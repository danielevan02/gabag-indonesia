"use client";

import VariantForm from "../../components/variant-form";
import slugify from "react-slugify";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { productSchema } from "@/lib/schema";
import { Loader, Plus } from "lucide-react";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";
import { trpc } from "@/trpc/client";
import { ProductImagesField } from "../../components/product-images-field";

export type ProductFormType = z.infer<typeof productSchema>;

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
      weight: 0,
      width: 0,
      height: 0,
      length: 0,
      subCategory: "",
      images: [],
      name: "",
      description: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    const allValues = form.getValues()
    if (hasVariant) {
      form.reset({
        ...allValues,
        price: undefined,
        stock: 0,
        sku: '',
        hasVariant,
        variants: [
          {
            image: "",
            name: "",
            regularPrice: 0,
            sku: "",
            stock: 0,
          },
        ],
      });
    } else {
      form.reset({
        ...allValues,
        hasVariant,
        variants: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVariant]);

  const onSubmit = async (data: ProductFormType) => {
    try {
      await mutateAsync({
        ...data,
        slug: slugify(data.name),
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to create product");
    }
  };

  const onError = (error: any) => {
    console.log(error);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3"
      >
        <FormInput
          form={form}
          fieldType="text"
          label="Name"
          name="name"
          type="text"
          placeholder="e.g: Pombag"
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

        <ProductImagesField
          form={form}
          allMediaFiles={allMediaFiles}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Discount (optional)"
          description="If this product has variants, the discount will automatically apply to all of them."
          name="discount"
          type="number"
          placeholder="e.g: 23"
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
              placeholder="e.g: 234000"
              disabled={isPending}
            />

            <FormInput
              form={form}
              fieldType="text"
              label="SKU"
              name="sku"
              type="text"
              placeholder="e.g: 9920041184923"
              disabled={isPending}
            />

            <FormInput
              form={form}
              fieldType="text"
              label="Stock"
              name="stock"
              type="number"
              placeholder="e.g: 40"
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
          placeholder="e.g: 300"
          disabled={isPending}
        />

        <div className="flex gap-2 items-center">
          <FormInput
            form={form}
            fieldType="text"
            label="Length (cm)"
            name="length"
            type="number"
            placeholder="e.g: 12"
            disabled={isPending}
          />{" "}
          x
          <FormInput
            form={form}
            fieldType="text"
            label="Width (cm)"
            name="width"
            type="number"
            placeholder="e.g: 10"
            disabled={isPending}
          />{" "}
          x
          <FormInput
            form={form}
            fieldType="text"
            label="Height (cm)"
            name="height"
            type="number"
            placeholder="e.g: 22"
            disabled={isPending}
          />
        </div>

        <FormInput
          form={form}
          fieldType="textarea"
          label="Description"
          name="description"
          placeholder="e.g: tas yang memiliki 2 fungsi sebagai cooler bag atau/dan..."
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
