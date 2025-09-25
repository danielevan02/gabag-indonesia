"use client";

import { categorySchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput } from "@/components/shared/input/form-input";
import { Form } from "@/components/ui/form";
import { trpc } from "@/trpc/client";
import { RouterOutputs } from "@/trpc/routers/_app";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { CategoryImageField } from "../../components/category-image-field";

export type CategoryFormType = z.infer<typeof categorySchema>;

type Category = RouterOutputs['category']['getById']

export default function EditCategoryForm({ category }: { category: Category }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.category.update.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        utils.category.getAll.invalidate();
        router.push("/admin/catalog/category");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to update category");
      console.error(error);
    },
  });

  const form = useForm<CategoryFormType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      mediaFileId: category.mediaFileId,
      name: category.name,
    },
  });

  const { data: allMediaFiles } = trpc.gallery.getAll.useQuery();


  const onSubmit = async (data: CategoryFormType) => {
    try {
      await mutateAsync({ ...data, id: category.id });
    } catch (error) {
      console.error(error)
    }
  };

  const onError = (error: any) => {
    console.log(error)
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1 gap-3"
      >
        <CategoryImageField
          form={form}
          fieldName="mediaFileId"
          allMediaFiles={allMediaFiles}
        />

        <FormInput
          form={form}
          fieldType="text"
          label="Name"
          name="name"
          placeholder="Please enter category name"
          disabled={isPending}
        />

         <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader className="size-4 animate-spin" /> : "Update"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
