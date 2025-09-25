import { Variant } from "@/app/(root)/products/[slug]/components/variant-section";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useCallback, useMemo, useState } from "react";

type Product = RouterOutputs['product']['getBySlug'];

export const useQuantityControls = (product: Product, variant?: Variant, isLoading: boolean = false) => {
  const [quantity, setQuantity] = useState(1);

  const controls = useMemo(() => {
    const isMinusDisabled = (product.hasVariant && !variant) || isLoading || quantity === 1;
    const isPlusDisabled = 
      (product.hasVariant && !variant) || 
      isLoading || 
      (product.hasVariant ? variant?.stock === quantity : product.stock === quantity);

    return { isMinusDisabled, isPlusDisabled };
  }, [product, variant, isLoading, quantity]);

  const handleDecrease = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  const handleIncrease = useCallback(() => {
    const maxStock = product.hasVariant ? variant?.stock : product.stock;
    if (maxStock && quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  }, [quantity, product, variant]);

  const resetQuantity = useCallback(() => {
    setQuantity(1);
  }, []);

  return {
    quantity,
    setQuantity,
    resetQuantity,
    handleDecrease,
    handleIncrease,
    ...controls
  };
};