import ProductCard from "@/components/shared/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/server";

const BreastPumpSection = async () => {
  const products = await trpc.product.getAll({});
  return (
    <section>
      <div className="flex flex-col w-full md:w-[460px] mx-auto mb-5 mt-10 gap-2">
        <h3 className="text-2xl lg:text-4xl font-bold text-center mt-20">Kolibri Breastpump</h3>
        <p className="text-center w-full text-xs lg:text-sm text-neutral-400">
          Effortless and comfortable pumping with Kolibri! Portable, gentle, and designed for modern
          moms.
        </p>
      </div>
      <hr className="mb-3 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />

      <div className="relative">
        <div className="absolute inset-0 -bottom-1 bg-gradient-to-b from-transparent via-transparent to-background" />
        <video autoPlay loop muted playsInline className="w-screen h-screen object-cover">
          <source src="/home-video.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="flex gap-1 mt-10 md:gap-5 overflow-scroll no-scrollbar py-px snap-x snap-mandatory">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            {...product}
            image={product.images[0]}
            subCategory={product.subCategory!}
            className={`
                min-w-56 
                max-w-56 
                md:min-w-80 
                md:max-w-80 
                lg:min-w-96
                lg:max-w-96
                snap-start
              `}
          />
        ))}
      </div>
    </section>
  );
};

export const BreastPumpSectionFallback = () => {
  return(
    <section>
      <div className="flex flex-col w-full md:w-[460px] mx-auto mb-5 mt-10 gap-2">
        <h3 className="text-2xl lg:text-4xl font-bold text-center mt-20">Kolibri Breastpump</h3>
        <p className="text-center w-full text-xs lg:text-sm text-neutral-400">
          Effortless and comfortable pumping with Kolibri! Portable, gentle, and designed for modern
          moms.
        </p>
      </div>
      <hr className="mb-3 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />

      <div className="relative">
        <div className="absolute inset-0 -bottom-1 bg-gradient-to-b from-transparent via-transparent to-background" />
        <video autoPlay loop muted playsInline className="w-screen h-screen object-cover">
          <source src="/home-video.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="flex gap-1 mt-10 md:gap-5 overflow-scroll no-scrollbar py-px snap-x snap-mandatory">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="min-w-60 md:min-w-sm aspect-[1/1.8]"/>
        ))}
      </div>
    </section>
  )
}


export default BreastPumpSection;
