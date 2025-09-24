import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import BlurImage from "@/components/shared/blur-image";
import { trpc } from "@/trpc/server";

export const NewArrivalSection = async () => {
  const newArrival = await trpc.product.getNewArrivals()
  return (
    <section className="mt-20 lg:px-[14rem]">
      <h3 className="md:text-2xl text-xl text-center md:text-start">
        Shop by New Arrival Products
      </h3>
      <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
      <div className="flex flex-col md:flex-row gap-10 md:gap-1">
        {newArrival.map((product) => (
          <Link
            href={`/products/${product.slug}`}
            key={product.slug}
            className="w-full flex flex-col items-center"
          >
            <BlurImage
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className={`
                  w-full 
                  min-h-96 
                  max-h-96 
                  md:min-h-[500px]
                  md:max-h-[500px]
                  lg:min-h-[600px]
                  lg:max-h-[600px]
                  object-cover
                `}
              dynamic
            />
            <h2 className="text-center mt-3 lg:text-xl w-72 lg:w-96">
              {product.name}
            </h2>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const NewArrivalSectionFallback = () => {
  return(
    <section className="mt-20 lg:px-20">
      <h3 className="md:text-2xl text-xl text-center md:text-start">
        Shop by New Arrival Products
      </h3>
      <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
      <div className="flex flex-col md:flex-row gap-10 md:gap-5 lg:gap-5 justify-center">
        {[...Array(2)].map((_, index) => (
          <Skeleton key={index} className="w-full aspect-square"/>
        ))}
      </div>
    </section>
  )
}
