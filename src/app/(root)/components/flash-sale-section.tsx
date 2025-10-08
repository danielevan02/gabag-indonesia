import { CountDown } from "@/components/shared/count-down";
import ProductCard from "@/components/shared/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/server";

export async function FlashSaleSection() {
  try {
    const {campaign, products} = await trpc.campaign.getDisplay()

    if(!campaign || products.length === 0 ) return null

    return (
      <section className="mt-20">
        <div className="flex justify-between mb-2 items-center lg:items-end flex-col lg:flex-row">
          <h3 className="text-3xl font-light uppercase lg:normal-case lg:font-normal lg:text-2xl text-center md:text-start mb-3 lg:mb-0">{campaign.name} Products</h3>
          {campaign.endDate && (
            <CountDown time={campaign.endDate}/>
          )}
        </div>
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
  } catch (error) {
    console.error('Error loading flash sale section:', error);
    return null;
  }
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