"use client";

import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { UploadFn } from "@/components/upload/uploader-provider";
import { useEdgeStore } from "@/lib/edge-store";
import { subCategorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubCategory } from "@prisma/client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
// import { toast } from "sonner";

type SubCategoryFormType = SubCategory & {
  category: {
    id: string;
    name: string;
  };
  products: {
    id: string;
    name: string;
  }[];
};

const EditSubCategoryForm = ({ subCategory }: { subCategory: SubCategoryFormType }) => {
  const { edgestore } = useEdgeStore();
  const [isLoading, startTransition] = useTransition()
  const router = useRouter()
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
      image: subCategory.image??"",
      discount: subCategory.discount??0,
      category: {
        label: subCategory.category.name,
        value: subCategory.category.id
      },
      products: subCategory.products.map((product)=> ({
        label: product.name,
        value: product.id
      }))
    }
  });

  const handleUpload: UploadFn = useCallback(
    async ({ file, onProgressChange, signal }) => {
      const res = await edgestore.publicImages.upload({
        file,
        signal,
        onProgressChange,
      });

      setValue("image", res.url);
      return res;
    },
    [edgestore.publicImages, setValue]
  );

  const onSubmit = async (data: SubCategoryFormType) => {
    // startTransition(async () => {
    //   const res = await createSubCategory(data);
    //   toast.success(res.message);
    // });
    router.push("/admin/catalog/sub-category");
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
    >
      <FormField<SubCategoryFormType>
        label="Name"
        name="name"
        placeholder="Please enter sub category name"
        register={register}
        errors={errors}
        required
      />
      <FormField<SubCategoryFormType>
        label="Select Category"
        name="category"
        placeholder="Please choose the main category"
        type="select"
        errors={errors}
        options={}
        control={control}
        required
      />
      <FormField<SubCategoryFormType>
        label="Select Products"
        name="products"
        placeholder="Please choose the products"
        type="select"
        errors={errors}
        isMulti
        options={products}
        control={control}
      />
      <FormField<SubCategoryFormType>
        label="Discount (optional)"
        name="discount"
        placeholder="Please input the discount"
        errors={errors}
        register={register}
        type="number"
      />

      <div className="w-fit">
        <FormField<SubCategoryFormType>
          label="Image"
          name="image"
          type="image"
          uploadFn={handleUpload}
          errors={errors}
          setIsImageUploaded={setIsImageUploaded}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="destructive" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isImageUploaded || isLoading}>
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditSubCategoryForm;
