import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/server";
import Link from "next/link";
import Image from "next/image";

export const CategorySection = async () => {
  const subCategories = await trpc.subCategory.display()
  return (
    <section className="mt-20">
      <h2 className="text-xl lg:text-2xl font-semibold tracking-widest text-center mb-5 lg:mb-10">
        Shop by Categories
      </h2>
      <div className="hidden lg:grid grid-cols-3 w-3xl xl:w-4xl mx-auto gap-4">
        {subCategories.map((subCategory) => (
            <Link
              href={`/products/?category=${subCategory.categoryId}&subCategories=${subCategory.id}`}
              key={subCategory.id}
              className={cn(
                "flex flex-col gap-2 group col-span-1 focus:ring-2 focus:ring-blue-500 lg:focus:ring-0 focus:outline-none rounded-md",
              )}
              tabIndex={0}
            >
              <div className="w-full min-h-72 max-h-72 overflow-hidden">
                <Image
                  src={subCategory.mediaFile?.secure_url||"/images/placeholder-product.png"}
                  alt={subCategory.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all object-center"
                />
              </div>
              <h3 className="text-center font-semibold">{subCategory.name}</h3>
            </Link>
          ))}
      </div>

      {/* MOBILE VIEW */}
      <div className="flex lg:hidden gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px snap-mandatory snap-x">
        {subCategories.map((category) => (
          <Link
            href={`/products/?category=${category.categoryId}&subCategories=${category.id}`}
            key={category.id}
            className="flex flex-col gap-2 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-md snap-start"
          >
            <div className="min-w-56 min-h-56 max-h-56 overflow-hidden">
              <Image
                src={category.mediaFile?.secure_url||"/images/placeholder-product.png"}
                alt={category.name}
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-center font-bold text-sm">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export const CategorySectionFallback = () => {
  return (
    <section className="mt-20">
      <h2 className="text-xl lg:text-2xl font-semibold tracking-widest text-center mb-5 lg:mb-10">
        Shop by Categories
      </h2>
      <div className="hidden lg:grid grid-cols-3 w-3xl xl:w-4xl mx-auto gap-4">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="w-full min-h-72 max-h-72 flex flex-col gap-2 group col-span-1 overflow-hidden">
            <Skeleton className="size-full"/>
          </div>
        ))}
      </div>

      {/* MOBILE VIEW */}
      <div className="flex lg:hidden gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="min-w-56 min-h-56 max-h-56 flex flex-col gap-2 overflow-hidden">
            <Skeleton className="size-full"/>
          </div>
        ))}
      </div>
    </section>
  )
}