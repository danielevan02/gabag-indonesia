"use client";

import { ProductFormType } from "@/app/admin/catalog/product/add/components/product-form";
import { FormInput } from "@/components/shared/input/form-input";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { voucherSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
// import { toast } from "sonner";
import { z } from "zod";

export type VoucherFormType = z.infer<typeof voucherSchema>;

export default function VoucherForm({
  // products,
}: {
  products: {
    value: string;
    label: string;
  }[];
}) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(voucherSchema),
  });

  const onSubmit = async (
    // data: VoucherFormType
  ) => {
    startTransition(async () => {
      
    });
  };

  const onError: SubmitErrorHandler<ProductFormType> = (error) => {
    console.log(error);
  };

  const handleGenerateVoucher = () => {
    
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-y-scroll px-1"
      >
        <div>
          <FormInput
            form={form}
            fieldType="text"
            label="Voucher Code"
            name="code"
            type="text"
            placeholder="Enter product name"
            disabled={isLoading}
          />
          <Button onClick={handleGenerateVoucher}>Generate Voucher Code</Button>
        </div>

        

        <div className="flex justify-end gap-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isLoading}
            onClick={() => router.push("/admin/event")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Create Event"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
