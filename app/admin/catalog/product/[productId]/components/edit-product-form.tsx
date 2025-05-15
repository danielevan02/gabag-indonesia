"use client";

import { FormField } from "@/components/shared/input/form-field";
import { Button } from "@/components/ui/button";
import { UploadFn } from "@/components/upload/uploader-provider";
import { updateProduct } from "@/lib/actions/product.action";
import { useEdgeStore } from "@/lib/edge-store";
import { productSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProductFormType } from "../../add/components/product-form";
import { generateFileName } from "@/lib/utils";

interface EditProductFormProps {
  product: {
    id: string;
    name: string;
    subCategory: {
      value: string;
      label: string;
    } | null;
    image: string;
    price: number;
    discount: number;
    description: string;
  };
  subCategoryList: {
    value: string;
    label: string;
  }[];
}

const EditProductForm = ({ product, subCategoryList }: EditProductFormProps) => {
  const { edgestore } = useEdgeStore();
  const [isLoading, startTransition] = useTransition();
  const [triggerUpload, setTriggerUpload] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<ProductFormType>({} as ProductFormType);

  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product.name,
      subCategory: product.subCategory,
      price: product.price,
      discount: product.discount,
      description: product.description,
      image: product.image,
    },
  });

  const handleUpload: UploadFn = async ({ file, signal, onProgressChange }) => {
    startTransition(async () => {
      await edgestore.publicImages.delete({ url: product.image });

      const res = await edgestore.publicImages.upload({
        file,
        signal,
        onProgressChange,
        options: {
          manualFileName: generateFileName('product', data.name, product.image),
        }
      });

      try {
        const response = await updateProduct({ ...data, image: res.url, id: product.id });
        if (response.success) {
          toast.success(response.message);
          router.push("/admin/catalog/product");
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        console.log(error);
      }
    });

    return { url: "" };
  };

  const onSubmit = async (data: ProductFormType) => {
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
        placeholder="Please enter product name"
        register={register}
        errors={errors}
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
        required
      />
      <FormField
        label="Price"
        name="price"
        type="number"
        placeholder="Please enter product price"
        register={register}
        errors={errors}
        required
      />
      <div className="w-fit">
        <FormField
          label="Image"
          name="image"
          type="multi-image"
          uploadFn={handleUpload}
          triggerUpload={triggerUpload}
          errors={errors}
          required
          initialPhoto={product.image}
        />
      </div>
      <FormField
        label="Discount (optional)"
        name="discount"
        type="number"
        placeholder="Please input the discount"
        errors={errors}
        register={register}
      />
      <FormField
        label="Description"
        name="description"
        type="textarea"
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
          {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm; 