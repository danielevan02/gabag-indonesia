"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { FormCheckbox } from "@/components/shared/input/form-checkbox";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { voucherSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";

export type VoucherFormType = z.infer<typeof voucherSchema>;

interface VoucherFormProps {
  categories: { id: string; name: string }[];
  subCategories: { id: string; name: string; categoryId: string }[];
  products: { id: string; name: string }[];
  variants: { id: string; name: string; productId: string }[];
}

export default function VoucherForm({
  categories,
  subCategories,
  products,
  variants,
}: VoucherFormProps) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [variantSearch, setVariantSearch] = useState("");

  const createVoucherMutation = trpc.voucher.create.useMutation();

  const form = useForm<VoucherFormType>({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      discountType: "FIXED",
      discountValue: 0,
      applicationType: "ALL_PRODUCTS",
      startDate: undefined,
      expiryDate: undefined,
      autoApply: false,
      canCombine: false,
      isActive: true,
    },
  });

  const discountType = form.watch("discountType");
  const applicationType = form.watch("applicationType");

  // Filter products based on search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filter variants based on search
  const filteredVariants = variants.filter((variant) =>
    variant.name.toLowerCase().includes(variantSearch.toLowerCase())
  );

  const onSubmit = async (data: VoucherFormType) => {
    startTransition(async () => {
      try {
        // Clean up data - remove undefined/null optional fields
        const cleanedData: any = {
          code: data.code,
          name: data.name,
          discountType: data.discountType,
          discountValue: data.discountValue,
          applicationType: data.applicationType,
          startDate: data.startDate,
          expiryDate: data.expiryDate,
          autoApply: data.autoApply,
          canCombine: data.canCombine,
          isActive: data.isActive,
        };

        // Add optional fields only if they have values
        if (data.description) cleanedData.description = data.description;
        if (data.maxDiscount) cleanedData.maxDiscount = data.maxDiscount;
        if (data.categoryId) cleanedData.categoryId = data.categoryId;
        if (data.subCategoryId) cleanedData.subCategoryId = data.subCategoryId;
        if (selectedProducts.length > 0) cleanedData.productIds = selectedProducts;
        if (selectedVariants.length > 0) cleanedData.variantIds = selectedVariants;
        if (data.maxShippingDiscount) cleanedData.maxShippingDiscount = data.maxShippingDiscount;
        if (data.minPurchase) cleanedData.minPurchase = data.minPurchase;
        if (data.totalLimit) cleanedData.totalLimit = data.totalLimit;
        if (data.limitPerUser) cleanedData.limitPerUser = data.limitPerUser;

        await createVoucherMutation.mutateAsync(cleanedData);
        toast.success("Voucher created successfully!");
        router.push("/admin/voucher");
      } catch (error) {
        toast.error("Failed to create voucher");
        console.error(error);
      }
    });
  };

  const onError: SubmitErrorHandler<VoucherFormType> = (error) => {
    console.log(error);
    toast.error("Please fill in all required fields");
  };

  const handleGenerateVoucher = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    form.setValue("code", code);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleVariant = (variantId: string) => {
    setSelectedVariants((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  // Sync selectedProducts with form validation
  useEffect(() => {
    form.setValue("productIds", selectedProducts);
  }, [selectedProducts, form]);

  // Sync selectedVariants with form validation
  useEffect(() => {
    form.setValue("variantIds", selectedVariants);
  }, [selectedVariants, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-scroll px-1 gap-3"
      >
        {/* Basic Information */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Basic Information</h3>

          <div className="flex flex-col gap-3">
            <FormInput
              form={form}
              fieldType="text"
              label="Voucher Code"
              name="code"
              placeholder="e.g., NEWYEAR2024"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="button" onClick={handleGenerateVoucher} className="w-fit">
              Generate Code
            </Button>
          </div>

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

          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-black cursor-pointer">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed Amount (Rp)</SelectItem>
                    <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormInput
            form={form}
            fieldType="text"
            label={discountType === "PERCENT" ? "Discount Percentage (%)" : "Discount Amount (Rp)"}
            name="discountValue"
            type="number"
            placeholder={discountType === "PERCENT" ? "e.g., 10" : "e.g., 50000"}
            disabled={isLoading}
          />

          {discountType === "PERCENT" && (
            <FormInput
              form={form}
              fieldType="text"
              label="Maximum Discount (Rp) - Optional"
              name="maxDiscount"
              type="number"
              placeholder="e.g., 100000"
              disabled={isLoading}
            />
          )}
        </div>

        {/* Application Scope */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Application Scope</h3>
          <FormDescription>
            Define where this voucher can be applied. If no scope is selected, it applies to
            subtotal.
          </FormDescription>

          <FormField
            control={form.control}
            name="applicationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apply To</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-black">
                      <SelectValue placeholder="Select application type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL_PRODUCTS">All Products (Subtotal)</SelectItem>
                    <SelectItem value="CATEGORY">Specific Category</SelectItem>
                    <SelectItem value="SUBCATEGORY">Specific Subcategory</SelectItem>
                    <SelectItem value="SPECIFIC_PRODUCTS">Specific Products</SelectItem>
                    <SelectItem value="SPECIFIC_VARIANTS">Specific Variants</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {applicationType === "CATEGORY" && (
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-black">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {applicationType === "SUBCATEGORY" && (
            <FormField
              control={form.control}
              name="subCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Subcategory</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-black">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subCategories.map((subCat) => (
                        <SelectItem key={subCat.id} value={subCat.id}>
                          {subCat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {applicationType === "SPECIFIC_PRODUCTS" && (
            <FormField
              control={form.control}
              name="productIds"
              render={() => (
                <FormItem>
                  <FormLabel>Select Products</FormLabel>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div key={product.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={product.id}
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProduct(product.id)}
                          />
                          <label
                            htmlFor={product.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {product.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No products found</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {applicationType === "SPECIFIC_VARIANTS" && (
            <FormField
              control={form.control}
              name="variantIds"
              render={() => (
                <FormItem>
                  <FormLabel>Select Variants</FormLabel>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search variants..."
                      value={variantSearch}
                      onChange={(e) => setVariantSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    {filteredVariants.length > 0 ? (
                      filteredVariants.map((variant) => (
                        <div key={variant.id} className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id={variant.id}
                            checked={selectedVariants.includes(variant.id)}
                            onCheckedChange={() => toggleVariant(variant.id)}
                          />
                          <label
                            htmlFor={variant.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {variant.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No variants found</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Shipping Configuration */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Shipping Discount (Optional)</h3>
          <FormDescription>
            Set maximum shipping fee discount. Leave empty if voucher doesn&apos;t apply to
            shipping.
          </FormDescription>

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
          <FormDescription>
            Set the date range when this voucher will be active and valid for use.
          </FormDescription>

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
          <h3 className="text-base font-semibold">Usage Limits (Optional)</h3>

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
            description="Make this voucher active immediately"
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
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Create Voucher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
