"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Category = { id: string; name: string };
type SubCategory = { id: string; name: string; categoryId: string };
type Product = { id: string; name: string; subCategoryId: string };
type Variant = { id: string; name: string; productId: string };

interface CreateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  subCategories: SubCategory[];
  products: Product[];
  variants: Variant[];
}

export default function CreateBatchDialog({
  open,
  onOpenChange,
  categories,
  subCategories,
  products,
  variants,
}: CreateBatchDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prefix: "",
    totalCodes: 100,
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 10,
    maxDiscount: "",
    applicationType: "ALL_PRODUCTS" as
      | "ALL_PRODUCTS"
      | "CATEGORY"
      | "SUBCATEGORY"
      | "SPECIFIC_PRODUCTS"
      | "SPECIFIC_VARIANTS",
    categoryId: "",
    subCategoryId: "",
    productIds: [] as string[],
    variantIds: [] as string[],
    minPurchase: "",
    startDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    canCombine: false,
  });

  const createBatchMutation = trpc.voucher.createBatch.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        onOpenChange(false);
        router.refresh();
        // Reset form
        setFormData({
          name: "",
          description: "",
          prefix: "",
          totalCodes: 100,
          discountType: "PERCENT",
          discountValue: 10,
          maxDiscount: "",
          applicationType: "ALL_PRODUCTS",
          categoryId: "",
          subCategoryId: "",
          productIds: [],
          variantIds: [],
          minPurchase: "",
          startDate: new Date().toISOString().split("T")[0],
          expiryDate: "",
          canCombine: false,
        });
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error("Failed to create batch: " + error.message);
    },
  });

  // Filter subcategories based on selected category
  const filteredSubCategories = useMemo(() => {
    if (!formData.categoryId) return subCategories;
    return subCategories.filter((sc) => sc.categoryId === formData.categoryId);
  }, [formData.categoryId, subCategories]);

  // Filter products based on selected subcategory
  const filteredProducts = useMemo(() => {
    if (!formData.subCategoryId) return products;
    return products.filter((p) => p.subCategoryId === formData.subCategoryId);
  }, [formData.subCategoryId, products]);

  // Filter variants based on selected products
  const filteredVariants = useMemo(() => {
    if (formData.productIds.length === 0) return variants;
    return variants.filter((v) => formData.productIds.includes(v.productId));
  }, [formData.productIds, variants]);

  const handleApplicationTypeChange = (value: string) => {
    setFormData({
      ...formData,
      applicationType: value as any,
      categoryId: "",
      subCategoryId: "",
      productIds: [],
      variantIds: [],
    });
  };

  const toggleProductSelection = (productId: string) => {
    setFormData({
      ...formData,
      productIds: formData.productIds.includes(productId)
        ? formData.productIds.filter((id) => id !== productId)
        : [...formData.productIds, productId],
    });
  };

  const toggleVariantSelection = (variantId: string) => {
    setFormData({
      ...formData,
      variantIds: formData.variantIds.includes(variantId)
        ? formData.variantIds.filter((id) => id !== variantId)
        : [...formData.variantIds, variantId],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.prefix || !formData.expiryDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validation based on application type
    if (formData.applicationType === "CATEGORY" && !formData.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (formData.applicationType === "SUBCATEGORY" && !formData.subCategoryId) {
      toast.error("Please select a subcategory");
      return;
    }
    if (formData.applicationType === "SPECIFIC_PRODUCTS" && formData.productIds.length === 0) {
      toast.error("Please select at least one product");
      return;
    }
    if (formData.applicationType === "SPECIFIC_VARIANTS" && formData.variantIds.length === 0) {
      toast.error("Please select at least one variant");
      return;
    }

    createBatchMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      prefix: formData.prefix,
      totalCodes: formData.totalCodes,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      applicationType: formData.applicationType,
      categoryId: formData.categoryId || undefined,
      subCategoryId: formData.subCategoryId || undefined,
      productIds: formData.productIds.length > 0 ? formData.productIds : undefined,
      variantIds: formData.variantIds.length > 0 ? formData.variantIds : undefined,
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : undefined,
      startDate: new Date(formData.startDate),
      expiryDate: new Date(formData.expiryDate),
      canCombine: formData.canCombine,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Voucher Batch</DialogTitle>
          <DialogDescription>
            Create multiple unique voucher codes at once. Each code can only be used once per user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Batch Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Promo Botol Ramadan"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="prefix">
                  Code Prefix <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) => {
                    // Only allow uppercase letters and numbers
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    setFormData({ ...formData, prefix: sanitized });
                  }}
                  placeholder="e.g., BOTOL20"
                  minLength={3}
                  maxLength={20}
                  required
                />
                <p className="text-xs text-gray-500">
                  Codes: {formData.prefix || "PREFIX"}-XXXXXXXX (3-20 characters, letters and numbers only)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCodes">
                Number of Codes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="totalCodes"
                type="number"
                min={1}
                max={10000}
                value={formData.totalCodes}
                onChange={(e) =>
                  setFormData({ ...formData, totalCodes: Number(e.target.value) })
                }
                required
              />
              <p className="text-xs text-gray-500">Max: 10,000 codes</p>
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm">Targeting</h3>
            <div className="space-y-2">
              <Label htmlFor="applicationType">
                Apply To <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.applicationType}
                onValueChange={handleApplicationTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                  <SelectItem value="CATEGORY">Specific Category</SelectItem>
                  <SelectItem value="SUBCATEGORY">Specific Subcategory</SelectItem>
                  <SelectItem value="SPECIFIC_PRODUCTS">Specific Products</SelectItem>
                  <SelectItem value="SPECIFIC_VARIANTS">Specific Variants</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            {formData.applicationType === "CATEGORY" && (
              <div className="space-y-2">
                <Label htmlFor="categoryId">
                  Select Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subcategory Selection */}
            {formData.applicationType === "SUBCATEGORY" && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="categoryId">Category (Optional Filter)</Label>
                    {formData.categoryId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, categoryId: "", subCategoryId: "" })}
                        className="h-auto py-1 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={formData.categoryId || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value, subCategoryId: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategoryId">
                    Select Subcategory <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.subCategoryId}
                    onValueChange={(value) => setFormData({ ...formData, subCategoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subcategory..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Products Multi-Select */}
            {formData.applicationType === "SPECIFIC_PRODUCTS" && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="subCategoryId">Subcategory (Optional Filter)</Label>
                    {formData.subCategoryId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, subCategoryId: "" })}
                        className="h-auto py-1 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <Select
                    value={formData.subCategoryId || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subCategoryId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All subcategories..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subCategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Select Products <span className="text-red-500">*</span>
                  </Label>
                  {formData.productIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.productIds.map((id) => {
                        const product = products.find((p) => p.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {product?.name}
                            <button
                              type="button"
                              onClick={() => toggleProductSelection(id)}
                              className="ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-2">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={formData.productIds.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        <label
                          htmlFor={`product-${product.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {product.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.productIds.length} product(s) selected
                  </p>
                </div>
              </>
            )}

            {/* Variants Multi-Select */}
            {formData.applicationType === "SPECIFIC_VARIANTS" && (
              <>
                <div className="space-y-2">
                  <Label>Product Filter (Optional)</Label>
                  <div className="border rounded-md max-h-32 overflow-y-auto p-2 space-y-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-product-${product.id}`}
                          checked={formData.productIds.includes(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        <label
                          htmlFor={`filter-product-${product.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {product.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Select Variants <span className="text-red-500">*</span>
                  </Label>
                  {formData.variantIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.variantIds.map((id) => {
                        const variant = variants.find((v) => v.id === id);
                        return (
                          <Badge key={id} variant="secondary">
                            {variant?.name}
                            <button
                              type="button"
                              onClick={() => toggleVariantSelection(id)}
                              className="ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="border rounded-md max-h-48 overflow-y-auto p-2 space-y-2">
                    {filteredVariants.map((variant) => (
                      <div key={variant.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`variant-${variant.id}`}
                          checked={formData.variantIds.includes(variant.id)}
                          onCheckedChange={() => toggleVariantSelection(variant.id)}
                        />
                        <label
                          htmlFor={`variant-${variant.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {variant.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.variantIds.length} variant(s) selected
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Discount Settings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm">Discount Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discountType: value as "PERCENT" | "FIXED" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min={0}
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount (Rp)</Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min={0}
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPurchase">Minimum Purchase (Rp)</Label>
              <Input
                id="minPurchase"
                type="number"
                min={0}
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm">Validity Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">
                  Expiry Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createBatchMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBatchMutation.isPending}>
              {createBatchMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Generate {formData.totalCodes.toLocaleString()} Codes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
