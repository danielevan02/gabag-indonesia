import { getAllCategories } from "@/lib/actions/product.action";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const CategorySection = async () => {
  const categories = await getAllCategories()
  return (
    <section className="mt-20">
      <h2 className="text-xl lg:text-2xl font-semibold tracking-widest text-center mb-5 lg:mb-10">
        Shop by Categories
      </h2>
      <div className="hidden lg:grid grid-cols-12 w-3xl xl:w-4xl mx-auto gap-4">
        {categories
          .filter((val) => !val.isEventCategory)
          .map((category, index) => (
            <Link
              href="/"
              key={category.id}
              className={cn(
                "flex flex-col gap-2 group",
                index === 0 || index === 1 ? "col-span-6" : "col-span-4"
              )}
            >
              <div className="w-full min-h-72 max-h-72 overflow-hidden">
                <Image
                  src={category.image!}
                  alt={category.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover group-hover:scale-110 transition-all object-center"
                  priority
                />
              </div>
              <h3 className="text-center font-semibold">{category.name}</h3>
            </Link>
          ))}
      </div>

      {/* MOBILE VIEW */}
      <div className="flex lg:hidden gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px">
        {categories.map((category) => (
          <Link href="/" key={category.id} className="flex flex-col gap-2">
            <div className="min-w-56 min-h-56 max-h-56 overflow-hidden">
              <Image
                src={category.image!}
                alt={category.name}
                width={500}
                height={500}
                className="w-full h-full object-cover object-center"
                priority
              />
            </div>
            <h3 className="text-center font-bold text-sm">{category.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
