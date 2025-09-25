"use client";

import { Button } from "@/components/ui/button";
import { subCategorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/shared/input/form-input";
import { RouterOutputs } from "@/trpc/routers/_app";
import z from "zod";
import { SubCategoryImageField } from "../../components/subcategory-image-field";

interface EditSubCategoryFormProps {
  subCategory: RouterOutputs["subCategory"]["getById"];
  categoryList: {
    id: string;
    name: string;
  }[];
}

type SubCategoryFormType = z.infer<typeof subCategorySchema>;

const EditSubCategoryForm = ({ subCategory, categoryList }: EditSubCategoryFormProps) => {
  const router = useRouter();
  const { mutateAsync, isPending } = trpc.subCategory.update.useMutation({
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        router.push("/admin/catalog/sub-category");
      } else {
        toast.error(response.message);
      }
    },
  });

  const form = useForm({
    resolver: zodResolver(subCategorySchema),
    defaultValues: {
      name: subCategory?.name,
      category: subCategory?.category.id,
      products: subCategory?.products.map((prod) => prod.id),
      discount: subCategory?.discount,
      mediaFileId: subCategory?.mediaFileId,
    },
  });

  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();

  const onSubmit = async (data: SubCategoryFormType) => {
    try {
      await mutateAsync({ ...data, id: subCategory?.id });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3"
      >
        <SubCategoryImageField
          form={form}
          fieldName="mediaFileId"
          allMediaFiles={allMediaFiles}
        />

        <FormInput
          fieldType="text"
          form={form}
          label="Name"
          name="name"
          placeholder="Please enter sub category name"
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="select"
          label="Select Category"
          name="category"
          placeholder="Please choose the main category"
          options={categoryList}
          disabled={isPending}
        />

        <FormInput
          fieldType="select"
          form={form}
          label="Select Products"
          name="products"
          placeholder="Please choose the products"
          isMulti
          options={subCategory?.products}
          disabled={isPending}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Discount (optional)"
          name="discount"
          placeholder="Please input the discount"
          type="number"
          disabled={isPending}
        />

        <div className="flex justify-end gap-2">
          <Button variant="destructive" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="w-4 h-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditSubCategoryForm;
