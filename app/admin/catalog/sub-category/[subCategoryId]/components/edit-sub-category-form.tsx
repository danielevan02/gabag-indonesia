"use client";

import { ErrorMessage, FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { updateSubCategory } from "@/lib/actions/subCategory.action";
import { subCategorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, get, useForm } from "react-hook-form";
import { toast } from "sonner";
import { SubCategoryFormType } from "../../page";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import GalleryModal from "@/components/gallery/gallery-modal";

interface EditSubCategoryFormProps {
  subCategory: {
    id: string;
    name: string;
    category: {
      value: string;
      label: string;
    };
    image: string;
    discount: number;
    products: {
      value: string;
      label: string;
    }[];
  };
  categoryList: {
    value: string;
    label: string;
  }[];
}

const EditSubCategoryForm = ({ subCategory, categoryList }: EditSubCategoryFormProps) => {
  const [isLoading, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: subCategory.name,
      category: subCategory.category,
      products: subCategory.products,
      discount: subCategory.discount,
      image: subCategory.image,
    },
  });

  const onSubmit = async (data: SubCategoryFormType) => {
    startTransition(async () => {
      try {
        const response = await updateSubCategory({ ...data, id: subCategory.id });
        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/sub-category");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
    >
      <FormField
        label="Name"
        name="name"
        placeholder="Please enter sub category name"
        register={register}
        errors={errors}
        required
      />

      <FormField
        label="Select Category"
        name="category"
        placeholder="Please choose the main category"
        type="select"
        errors={errors}
        options={categoryList}
        control={control}
        required
      />

      <FormField
        label="Select Products"
        name="products"
        placeholder="Please choose the products"
        type="select"
        errors={errors}
        isMulti
        options={subCategory.products}
        control={control}
      />

      <Controller
        control={control}
        name="image"
        render={({ field }) => (
          <div className="flex gap-2 flex-col mb-5">
            <Label>Sub-Category Photo(s)</Label>
            <div className="flex flex-col gap-2">
              {field.value?.length !== 0 ? (
                // SHOW THIS IF THERE IS IMAGES
                <div className="w-full flex gap-2 justify-start flex-wrap">
                  <div className="size-32 overflow-hidden rounded-md border">
                    <Image
                      src={field.value||'/images/placeholder-product.png'}
                      alt="subcategory-image"
                      width={100}
                      height={100}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                // SHOW THIS IF THERE IS NO IMAGES
                <div className="flex flex-col items-center justify-center size-44 rounded-md border bg-accent gap-4">
                  <ImagePlus />
                  <span className="text-sm text-neutral-700">Add Sub-category Images</span>
                </div>
              )}

              <GalleryModal
                initialSelectedImages={field.value ? [field.value]:[]}
                setInitialSelectedImages={field.onChange}
              />

              {get(errors, "image") && <ErrorMessage message={get(errors, "image.message")}/>}
            </div>
          </div>
        )}
      />

      <FormField
        label="Discount (optional)"
        name="discount"
        placeholder="Please input the discount"
        errors={errors}
        register={register}
        type="number"
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
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditSubCategoryForm;
