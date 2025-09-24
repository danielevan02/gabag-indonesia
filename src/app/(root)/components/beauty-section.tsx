import ProductCard from "@/components/shared/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/server";

export const BeautySection = async () => {
  const beauty = await trpc.product.getAll({subCategory: "Beauty"})
  
  return (
    <section className="mt-20">
      <div className="flex flex-col w-full md:w-96 mx-auto mb-5">
        <h2 className="text-2xl lg:text-4xl font-bold text-center">GabaG Beauty</h2>
        <p className="text-center w-full text-xs lg:text-sm text-neutral-400">
          A stylish storage solution for your beauty essentials! Practical, elegant, and ready to
          accompany your daily routine.
        </p>
      </div>
      <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
      <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px snap-x snap-mandatory">
        {beauty.map((product) => (
          <ProductCard
            key={product.slug}
            {...product}
            className="product-card-container"
          />
        ))}
      </div>
    </section>
  );
};

export const BeautySectionFallback = () => {
  return(
    <section className="mt-20">
      <div className="flex flex-col w-full md:w-96 mx-auto mb-5">
        <h2 className="text-2xl lg:text-4xl font-bold text-center">GabaG Beauty</h2>
        <p className="text-center w-full text-xs lg:text-sm text-neutral-400">
          A stylish storage solution for your beauty essentials! Practical, elegant, and ready to
          accompany your daily routine.
        </p>
      </div>
      <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
      <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px snap-x snap-mandatory">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="min-w-60 md:min-w-sm aspect-[1/1.8]"/>
        ))}
      </div>
    </section>
  )
}