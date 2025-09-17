import ProductCard from "@/components/shared/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFlashSaleProducts } from "@/lib/actions/event.action";

export default async function FlashSaleSection() {
  const products = await getFlashSaleProducts();

  return (
    <section className="mt-20">
      <h3 className="text-2xl text-center md:text-start">Flash Sale Products</h3>
      <hr className="horizontal-line" />
      <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory px-1 py-px ">
        {products.map((product) => {
          return (
            <ProductCard
              key={product.slug}
              className="min-w-56 max-w-56 md:min-w-80 md:max-w-80 lg:min-w-96 lg:max-w-96 snap-start"
              {...product}
            />
          );
        })}
      </div>
    </section>
  );
}

export const FlashSaleSectionFallback = () => {
  return (
    <section className="mt-20">
      <h3 className="text-2xl text-center md:text-start">Flash Sale Products</h3>
      <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
      <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory px-1 py-px ">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="min-w-60 md:min-w-sm aspect-[1/1.8]" />
        ))}
      </div>
    </section>
  );
};
