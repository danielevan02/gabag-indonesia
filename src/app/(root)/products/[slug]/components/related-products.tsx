import { trpc } from "@/trpc/server";
import ProductCard from "@/components/shared/product-card";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  subCategoryName: string;
}

const RelatedProducts = async ({ subCategoryName }: RelatedProductsProps) => {
  const result = await trpc.product.getAll({ subCategory: subCategoryName });

  if (!result.products || result.products.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <p className="text-lg lg:text-2xl">You Might Also Like</p>
      <div className="flex gap-1 mt-5 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory py-px">
        {result.products.map((product) => (
          <ProductCard
            {...product}
            key={product.slug}
            className="product-card-container"
          />
        ))}
      </div>
    </div>
  );
};

export const RelatedProductsFallback = () => {
  return (
    <div className="mt-10">
      <Skeleton className="h-8 w-48 mb-5" />
      <div className="flex gap-1 md:gap-5 overflow-hidden">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="product-card-container aspect-[1/1.9]" />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
