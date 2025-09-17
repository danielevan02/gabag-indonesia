import { getProductBySlug } from "@/lib/actions/product.action";
import { useMemo } from "react";

type Product = Awaited<ReturnType<typeof getProductBySlug>>;

export const useProductData = (product: Product) => {
  return useMemo(() => {
    const lowestPrice = Math.min(...(product.variants?.map((v) => Number(v.price)) ?? [0]));
    const imagesList = [
      ...(product?.images || []),
      ...(product?.variants?.map((v) => v.image ?? [""]) || []),
    ];
    const sold = product.orderItems?.reduce((initial, curr) => curr.qty + initial, 0) || 0;
    const stock = product.variants?.reduce((curr, v) => curr + v.stock, 0) || product.stock || 0;

    return { lowestPrice, imagesList, sold, stock };
  }, [product]);
};