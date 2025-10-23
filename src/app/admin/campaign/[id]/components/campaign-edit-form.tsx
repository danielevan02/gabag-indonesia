"use client";

import { FormInput } from "@/components/shared/input/form-input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { campaignSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { trpc } from "@/trpc/client";

export type CampaignFormType = z.infer<typeof campaignSchema>;

interface Variant {
  id: string;
  name: string;
  regularPrice: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  regularPrice: number;
  stock: number;
  hasVariant: boolean;
  variants?: Variant[];
}

interface CampaignItem {
  productId: string;
  variantId?: string;
  displayName: string;
  regularPrice: number;
  customDiscount?: number;
  customDiscountType?: "PERCENT" | "FIXED";
  stockLimit?: number;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  discountType: "PERCENT" | "FIXED";
  defaultDiscount: number;
  startDate: Date;
  endDate?: Date | null;
  priority: number;
  items: Array<{
    productId: string;
    variantId?: string | null;
    product: {
      id: string;
      name: string;
      hasVariant: boolean;
    };
    variant?: {
      id: string;
      name: string;
    } | null;
    customDiscount?: number | null;
    customDiscountType?: "PERCENT" | "FIXED" | null;
    stockLimit?: number | null;
  }>;
}

interface CampaignEditFormProps {
  campaign: Campaign;
  products: Product[];
}

export default function CampaignEditForm({ campaign, products }: CampaignEditFormProps) {
  const router = useRouter();
  const [isLoading, startTransition] = useTransition();
  const [itemSearch, setItemSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<CampaignItem[]>([]);

  const updateCampaignMutation = trpc.campaign.update.useMutation();

  const form = useForm<CampaignFormType>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: campaign.name,
      description: campaign.description || "",
      type: campaign.type as any,
      discountType: campaign.discountType,
      defaultDiscount: campaign.defaultDiscount,
      startDate: new Date(campaign.startDate),
      endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
      priority: campaign.priority,
      items: [],
    },
  });

  const discountType = form.watch("discountType");

  // Initialize selected items from existing campaign
  useEffect(() => {
    const initialItems: CampaignItem[] = campaign.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      let displayName = item.product.name;
      let regularPrice = product?.regularPrice || 0;

      if (item.variantId && item.variant) {
        displayName = `${item.product.name} - ${item.variant.name}`;
        const variant = product?.variants?.find((v) => v.id === item.variantId);
        regularPrice = variant?.regularPrice || regularPrice;
      }

      return {
        productId: item.productId,
        variantId: item.variantId || undefined,
        displayName,
        regularPrice: Number(regularPrice),
        customDiscount: item.customDiscount || undefined,
        customDiscountType: item.customDiscountType || undefined,
        stockLimit: item.stockLimit || undefined,
      };
    });

    setSelectedItems(initialItems);

    // Sync with form immediately
    form.setValue("items", initialItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      customDiscount: i.customDiscount,
      customDiscountType: i.customDiscountType,
      stockLimit: i.stockLimit,
    })));
  }, [campaign.items, products, form]);

  // Flatten products and variants into a single list
  const flattenedItems: Array<{
    productId: string;
    variantId?: string;
    displayName: string;
    regularPrice: number;
    stock: number;
  }> = products.flatMap((product) => {
    if (product.hasVariant && product.variants && product.variants.length > 0) {
      return product.variants.map((variant) => ({
        productId: product.id,
        variantId: variant.id as string,
        displayName: `${product.name} - ${variant.name}`,
        regularPrice: variant.regularPrice,
        stock: variant.stock,
      }));
    } else {
      return [{
        productId: product.id,
        variantId: undefined as string | undefined,
        displayName: product.name,
        regularPrice: product.regularPrice,
        stock: product.stock,
      }];
    }
  });

  // Filter items based on search and exclude already selected
  const filteredItems = flattenedItems.filter((item) => {
    const matchesSearch = item.displayName.toLowerCase().includes(itemSearch.toLowerCase());
    const isNotSelected = !selectedItems.some(
      (si) => si.productId === item.productId && si.variantId === item.variantId
    );
    return matchesSearch && isNotSelected;
  });

  const onSubmit = async (data: CampaignFormType) => {
    startTransition(async () => {
      try {
        await updateCampaignMutation.mutateAsync({
          id: campaign.id,
          data: {
            ...data,
            items: selectedItems.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              customDiscount: i.customDiscount,
              customDiscountType: i.customDiscountType,
              stockLimit: i.stockLimit,
            })),
          },
        });
        toast.success("Campaign updated successfully!");
        router.push("/admin/campaign");
        router.refresh();
      } catch (error) {
        toast.error("Failed to update campaign");
        console.error(error);
      }
    });
  };

  const onError: SubmitErrorHandler<CampaignFormType> = (error) => {
    console.log(error);
    toast.error("Please fill in all required fields");
  };

  const toggleItem = (item: { productId: string; variantId?: string; displayName: string; regularPrice: number }) => {
    const newItem: CampaignItem = {
      productId: item.productId,
      variantId: item.variantId,
      displayName: item.displayName,
      regularPrice: Number(item.regularPrice),
    };
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);

    // Sync with form
    form.setValue("items", updatedItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      customDiscount: i.customDiscount,
      customDiscountType: i.customDiscountType,
      stockLimit: i.stockLimit,
    })));

    setItemSearch("");
  };

  const removeItem = (productId: string, variantId?: string) => {
    const updatedItems = selectedItems.filter((i) => !(i.productId === productId && i.variantId === variantId));
    setSelectedItems(updatedItems);

    // Sync with form
    form.setValue("items", updatedItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      customDiscount: i.customDiscount,
      customDiscountType: i.customDiscountType,
      stockLimit: i.stockLimit,
    })));
  };

  const updateItemDiscount = (
    productId: string,
    variantId: string | undefined,
    field: keyof CampaignItem,
    value: any
  ) => {
    const updatedItems = selectedItems.map((i) =>
      i.productId === productId && i.variantId === variantId ? { ...i, [field]: value } : i
    );
    setSelectedItems(updatedItems);

    // Sync with form
    form.setValue("items", updatedItems.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      customDiscount: i.customDiscount,
      customDiscountType: i.customDiscountType,
      stockLimit: i.stockLimit,
    })));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex flex-col my-5 flex-1 overflow-scroll px-1 gap-3"
      >
        {/* Basic Information */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Basic Information</h3>

          <FormInput
            form={form}
            fieldType="text"
            label="Campaign Name"
            name="name"
            placeholder="e.g., Flash Sale 12.12"
            disabled={isLoading}
          />

          <FormInput
            form={form}
            fieldType="textarea"
            label="Description"
            name="description"
            placeholder="Describe this campaign..."
            disabled={isLoading}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-black cursor-pointer">
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FLASH_SALE">Flash Sale</SelectItem>
                    <SelectItem value="DAILY_DEALS">Daily Deals</SelectItem>
                    <SelectItem value="PAYDAY_SALE">Payday Sale</SelectItem>
                    <SelectItem value="SEASONAL">Seasonal</SelectItem>
                    <SelectItem value="CLEARANCE">Clearance</SelectItem>
                    <SelectItem value="NEW_ARRIVAL">New Arrival</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Discount Configuration */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Default Discount</h3>
          <FormDescription>
            This discount will be applied to all products unless you set custom discount per product
          </FormDescription>

          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-black cursor-pointer">
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (Rp)</SelectItem>
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
            name="defaultDiscount"
            type="number"
            placeholder={discountType === "PERCENT" ? "e.g., 20" : "e.g., 50000"}
            disabled={isLoading}
          />
        </div>

        {/* Schedule */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Campaign Schedule</h3>
          <FormDescription>
            Campaign will auto-activate and deactivate based on these dates.
            Leave End Date empty for permanent campaign.
          </FormDescription>

          <FormInput
            form={form}
            fieldType="datetime"
            name="startDate"
            label="Start Date & Time"
            placeholder="Pick start date and time"
            disabled={isLoading}
          />

          <FormInput
            form={form}
            fieldType="datetime"
            name="endDate"
            label="End Date & Time (Optional)"
            placeholder="Leave empty for permanent campaign"
            disabled={isLoading}
          />
        </div>

        {/* Priority Settings */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Settings</h3>

          <FormInput
            form={form}
            fieldType="text"
            label="Priority"
            name="priority"
            type="number"
            placeholder="Higher number = higher priority (default: 0)"
            disabled={isLoading}
          />
          <FormDescription>
            If product is in multiple campaigns, highest priority will be applied
          </FormDescription>
        </div>

        {/* Item Selection */}
        <div className="space-y-4 border-b pb-6">
          <h3 className="text-base font-semibold">Select Items</h3>
          <FormDescription>
            Choose products or specific variants for this campaign. Set custom discounts per item if needed.
          </FormDescription>

          {/* Search & Add Items */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products or variants to add..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {itemSearch && filteredItems.length > 0 && (
            <div className="border rounded-md max-h-48 overflow-y-auto">
              {filteredItems.slice(0, 10).map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => toggleItem(item)}
                >
                  <div>
                    <p className="text-sm font-medium">{item.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      Rp {Number(item.regularPrice).toLocaleString()} • Stock: {item.stock}
                    </p>
                  </div>
                  <Button type="button" size="sm" variant="outline">
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Items */}
          {selectedItems.length === 0 ? (
            <div className="border-2 border-dashed rounded-md p-8 text-center text-muted-foreground">
              No items selected. Search and add products or variants above.
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Selected Items ({selectedItems.length})
              </p>
              {selectedItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variantId || 'base'}`}
                  className="border rounded-md p-4 space-y-3"
                >
                  {/* Item Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{item.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        Regular: Rp {item.regularPrice.toLocaleString()}
                        {item.variantId && <span className="ml-2 text-blue-600">(Variant)</span>}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Custom Discount */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Custom Discount (optional)
                      </label>
                      <Input
                        type="number"
                        placeholder="Use default"
                        value={item.customDiscount || ""}
                        onChange={(e) =>
                          updateItemDiscount(
                            item.productId,
                            item.variantId,
                            "customDiscount",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Type</label>
                      <Select
                        value={item.customDiscountType || "DEFAULT"}
                        onValueChange={(value) =>
                          updateItemDiscount(
                            item.productId,
                            item.variantId,
                            "customDiscountType",
                            value === "DEFAULT" ? undefined : value
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Use default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEFAULT">Use default</SelectItem>
                          <SelectItem value="PERCENT">Percent (%)</SelectItem>
                          <SelectItem value="FIXED">Fixed (Rp)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stock Limit */}
                  <div>
                    <label className="text-xs text-muted-foreground">
                      Stock Limit for Campaign (optional)
                    </label>
                    <Input
                      type="number"
                      placeholder="Unlimited"
                      value={item.stockLimit || ""}
                      onChange={(e) =>
                        updateItemDiscount(
                          item.productId,
                          item.variantId,
                          "stockLimit",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedItems.length === 0 && (
            <FormMessage className="text-red-500">
              At least one item is required
            </FormMessage>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 sticky bottom-0 inset-x-0 bg-background pt-4 pb-2">
          <Button
            variant="destructive"
            type="button"
            disabled={isLoading}
            onClick={() => router.push("/admin/campaign")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || selectedItems.length === 0}>
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Update Campaign"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
