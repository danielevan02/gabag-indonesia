// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
"use client";

import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
// import { updateSubCategory } from "@/lib/actions/subCategory.action";
import { useEdgeStore } from "@/lib/edge-store";
import { subCategorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
// import { toast } from "sonner";
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
  categoryList: {
    value: string;
    label: string;
  }[];
}

const EditSubCategoryForm = ({ subCategory, categoryList }: EditSubCategoryFormProps) => {
  const { edgestore } = useEdgeStore();
  const [isLoading, startTransition] = useTransition();
  const [triggerUpload, setTriggerUpload] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<SubCategoryFormType>();

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

  // const handleUpload = async () => {
  //   startTransition(async () => {
  //     await edgestore.publicImages.delete({url: subCategory.image});

  //     const res = await edgestore.publicImages.upload({
  //       file,
  //       signal,
  //       onProgressChange,
  //       options: {
  //         manualFileName: generateFileName('sub-category', data.name, subCategory.image),
  //       }
  //     });

  //     try {
  //       const response = await updateSubCategory({ ...data, image: '', id: subCategory.id });
  //       if (response.success) {
  //         toast.success(response.message);
  //         router.push("/admin/catalog/sub-category");
  //       } else {
  //         toast.error(response.message);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });

  //   return { url: "" };
  // };

  const onSubmit = async (data: SubCategoryFormType) => {
    setData(data);
    
    // this will trigger the handleUpload function
    setTriggerUpload(true);
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
