import { Skeleton } from "@/components/ui/skeleton";
import { getNewArrivalProduct } from "@/lib/actions/product.action";
import Image from "next/image";
import Link from "next/link";

const NewArrivalSection = async () => {
  const newArrival = await getNewArrivalProduct()
  return (
    <section className="mt-20 lg:px-20">
      <h3 className="md:text-2xl text-xl text-center md:text-start">
        Shop by New Arrival Products
      </h3>
      <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
      <div className="flex flex-col md:flex-row gap-10 md:gap-5 lg:gap-5">
        {newArrival.map((product) => (
          <Link
            href={`/products/${product.slug}`}
            key={product.slug}
            className="w-full flex flex-col items-center"
          >
            <Image
              src={product.images[0]}
              alt={product.name}
              width={500}
              height={500}
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
            />
            <h2 className="text-center mt-5 lg:text-xl font-semibold tracking-widest w-72 lg:w-96">
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

export default NewArrivalSection;
