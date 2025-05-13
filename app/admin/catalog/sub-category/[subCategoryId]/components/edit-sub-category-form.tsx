"use client";

import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { UploadFn } from "@/components/upload/uploader-provider";
import { updateSubCategory } from "@/lib/actions/subCategory.action";
import { useEdgeStore } from "@/lib/edge-store";
import { subCategorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SubCategoryFormType } from "../../page";

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
}

const EditSubCategoryForm = ({ subCategory }: EditSubCategoryFormProps) => {
  const { edgestore } = useEdgeStore();
  const [isLoading, startTransition] = useTransition();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>(
    subCategory.image
  );
  const router = useRouter();

  const {
    register,
    formState: { errors },
    control,
    setValue,
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

  const handleUpload: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      const res = await edgestore.publicImages.upload({
        file,
        signal,
        onProgressChange,
      });

      setUploadedImageUrl(res.url);
      setValue("image", res.url);
      return res;
    },
    [edgestore.publicImages, setValue]
  );

  const onSubmit = async (data: SubCategoryFormType) => {
    if (!uploadedImageUrl) {
      toast.error("Please upload an image first");
      return;
    }

    startTransition(async () => {
      try {
        const formData = {
          ...data,
          id: subCategory.id,
          image: uploadedImageUrl,
        };
        const res = await updateSubCategory(formData);
        if (res.success) {
          toast.success(res.message);
          router.push("/admin/catalog/sub-category");
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to update sub category");
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
        options={[subCategory.category]}
        control={control}
        required
      />
      <div className="w-fit">
        <FormField
          label="Image"
          name="image"
          type="image"
          uploadFn={handleUpload}
          errors={errors}
          required
          initialPhoto={subCategory.image}
        />
      </div>
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
