
/* eslint-disable */
"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/input/form-field";
// import { createSubCategory } from "@/lib/actions/subCategory.action";
import { useEdgeStore } from "@/lib/edge-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
// import { toast } from "sonner";
import { subCategorySchema } from "@/lib/schema";
import { SubCategoryFormType } from "../../page";
import { Loader } from "lucide-react";
// import { generateFileName } from "@/lib/utils";

const SubCategoryForm = ({
  category,
  products,
}: {
  category: { value: string; label: string }[];
  products: { value: string; label: string }[];
}) => {
  const router = useRouter();
  const { edgestore } = useEdgeStore();
  const [triggerUpload, setTriggerUpload] = useState(false);
  const [isLoading, startTransition] = useTransition();
  const [data, setData] = useState<SubCategoryFormType>(
    {} as SubCategoryFormType
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SubCategoryFormType>({
    resolver: zodResolver(subCategorySchema),
  });

  const onSubmit = async (data: SubCategoryFormType) => {
    setData(data);
    
    // this will trigger the handleUpload function
    setTriggerUpload(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-5">
      <FormField
        label="Name"
        name="name"
        type="text"
        register={register}
        errors={errors}
        required
        placeholder="Enter sub-category name"
        disabled={isLoading}
      />

      <FormField
        label="Category"
        name="category"
        type="select"
        control={control}
        errors={errors}
        required
        placeholder="Select category"
        options={category}
        disabled={isLoading}
      />

      <FormField
        label="Discount"
        name="discount"
        type="text"
        register={register}
        errors={errors}
        placeholder="Enter discount percentage"
        disabled={isLoading}
      />

      <FormField
        label="Products"
        name="products"
        type="select"
        control={control}
        errors={errors}
        isMulti
        placeholder="Select products"
        options={products}
        disabled={isLoading}
      />

      <div className="flex justify-end gap-2">
        <Button
          variant="destructive"
          type="button"
          disabled={isLoading}
          onClick={() => router.push("/admin/catalog/sub-category")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Create Sub-Category"}
        </Button>
      </div>
    </form>
  );
};

export default SubCategoryForm;
