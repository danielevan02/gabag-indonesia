"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { FormCheckbox } from "@/components/shared/input/form-checkbox";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/trpc/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Edit-specific schema without code field
const voucherEditSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  discountValue: z.coerce.number().min(0, "Discount value must be positive").optional(),
  maxDiscount: z.coerce.number().optional(),
  maxShippingDiscount: z.coerce.number().optional(),
  startDate: z.date().optional(),
  expiryDate: z.date().optional(),
  minPurchase: z.coerce.number().optional(),
  totalLimit: z.coerce.number().optional(),
  limitPerUser: z.coerce.number().optional(),
  autoApply: z.boolean().optional(),
  canCombine: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type VoucherEditFormType = z.infer<typeof voucherEditSchema>;

interface VoucherEditFormProps {
  voucher: any;
}

export default function VoucherEditForm({ voucher }: VoucherEditFormProps) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const utils = trpc.useUtils();

  const hasBeenUsed = voucher.usedCount > 0;

  const updateVoucherMutation = trpc.voucher.update.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        utils.voucher.getAll.invalidate();
        router.push("/admin/voucher");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<VoucherEditFormType>({
    resolver: zodResolver(voucherEditSchema),
    defaultValues: {
      name: voucher.name || "",
      description: voucher.description || "",
      discountValue: voucher.value,
      maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : undefined,
      startDate: voucher.startDate ? new Date(voucher.startDate) : undefined,
      expiryDate: voucher.expires ? new Date(voucher.expires) : undefined,
      minPurchase: voucher.minPurchase ? Number(voucher.minPurchase) : undefined,
      totalLimit: voucher.totalLimit || undefined,
      limitPerUser: voucher.limitPerUser || undefined,
      maxShippingDiscount: voucher.maxShippingDiscount ? Number(voucher.maxShippingDiscount) : undefined,
      autoApply: voucher.autoApply,
      canCombine: voucher.canCombine,
      isActive: voucher.isActive,
    },
  });

  const onSubmit = async (data: VoucherEditFormType) => {
    startTransition(async () => {
      updateVoucherMutation.mutate({
        id: voucher.id,
        data,
      });
    });
  };

  const onError: SubmitErrorHandler<VoucherEditFormType> = (error) => {
    console.log(error);
    toast.error("Please fill in all required fields");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-scroll px-1 gap-3"
      >
        {hasBeenUsed && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This voucher has been used {voucher.usedCount} time(s). Some fields cannot be edited.
            </AlertDescription>
          </Alert>
        )}

        {/* Read-only fields for used vouchers */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Voucher Information (Read-only)</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Code:</p>
              <p>{voucher.code}</p>
            </div>
            <div>
              <p className="font-medium">Discount Type:</p>
              <p>{voucher.type}</p>
            </div>
            <div>
              <p className="font-medium">Application Type:</p>
              <p>{voucher.applicationType}</p>
            </div>
            <div>
              <p className="font-medium">Used Count:</p>
              <p>{voucher.usedCount}</p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Basic Information</h3>

          <FormInput
            form={form}
            fieldType="text"
            label="Voucher Name"
            name="name"
            placeholder="e.g., New Year Sale"
            disabled={isLoading}
          />

          <FormInput
            form={form}
            fieldType="textarea"
            label="Description"
            name="description"
            placeholder="Describe this voucher..."
            disabled={isLoading}
          />
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Discount Configuration</h3>

          <FormInput
            form={form}
            fieldType="text"
            label={voucher.type === "PERCENT" ? "Discount Percentage (%)" : "Discount Amount (Rp)"}
            name="discountValue"
            type="number"
            placeholder={voucher.type === "PERCENT" ? "e.g., 10" : "e.g., 50000"}
            disabled={isLoading || hasBeenUsed}
          />

          {voucher.type === "PERCENT" && (
            <FormInput
              form={form}
              fieldType="text"
              label="Maximum Discount (Rp)"
              name="maxDiscount"
              type="number"
              placeholder="e.g., 100000"
              disabled={isLoading}
            />
          )}

          <FormInput
            form={form}
            fieldType="text"
            label="Maximum Shipping Discount (Rp)"
            name="maxShippingDiscount"
            type="number"
            placeholder="e.g., 20000"
            disabled={isLoading}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Validity Period</h3>

          <FormInput
            form={form}
            fieldType="datetime"
            name="startDate"
            label="Start Date & Time"
            placeholder="Pick a start date and time"
            disabled={isLoading}
          />

          <FormInput
            form={form}
            fieldType="datetime"
            name="expiryDate"
            label="Expiry Date & Time"
            placeholder="Pick an expiry date and time"
            disabled={isLoading}
          />
        </div>

        {/* Usage Limits */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Usage Limits</h3>

          <FormInput
            form={form}
            fieldType="text"
            label="Minimum Purchase (Rp)"
            name="minPurchase"
            type="number"
            placeholder="e.g., 100000"
            disabled={isLoading}
          />

          <FormInput
            form={form}
            fieldType="text"
            label="Total Vouchers Available"
            name="totalLimit"
            type="number"
            placeholder="e.g., 100"
            disabled={isLoading}
          />

          <FormInput
            form={form}
            fieldType="text"
            label="Limit Per User"
            name="limitPerUser"
            type="number"
            placeholder="e.g., 1"
            disabled={isLoading}
          />
        </div>

        {/* Behavior Settings */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Behavior Settings</h3>

          <FormCheckbox
            form={form}
            name="autoApply"
            label="Auto Apply"
            description="Automatically apply this voucher if order meets requirements"
            disabled={isLoading}
          />

          <FormCheckbox
            form={form}
            name="canCombine"
            label="Stackable"
            description="Allow this voucher to be combined with other vouchers"
            disabled={isLoading}
          />

          <FormCheckbox
            form={form}
            name="isActive"
            label="Active"
            description="Toggle voucher active/inactive status"
            disabled={isLoading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 sticky bottom-0 inset-x-0 bg-background pt-4 pb-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isLoading}
            onClick={() => router.push("/admin/voucher")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Update Voucher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
