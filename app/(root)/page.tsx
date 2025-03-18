import ProductCard from "@/components/shared/product/product-card";
import HomeCarousel from "./components/home-carousel";
import { Metadata } from "next";
import Image from "next/image";
import { getAllCategories, getAllProducts, getNewArrivalProduct } from "@/lib/actions/product.action";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Temukan Gabag! pompa ASI dan tas cooler premium untuk ibu modern. Praktis, stylish, dan sempurna untuk kebutuhan menyusui di mana saja!'
}

const HomePage = async () => {
  const categories = await getAllCategories()
  const products = await getAllProducts() || []
  const beauty = await getAllProducts("Beauty") || []
  const newArrival = await getNewArrivalProduct()
  return (
    <div className="flex flex-col mx-5 ">
      <HomeCarousel slideDuration={5000} />

      <section className="mt-20">
        <h2 className="text-2xl font-bold text-center mb-2">Shop by Categories</h2>
        <div className="hidden lg:grid grid-cols-12 w-[50%] mx-auto gap-4">
          {categories.filter((val) => !val.isEventCategory).map((category, index) => (
            <Link href='/' key={category.id} className={cn("flex flex-col gap-2 group", 
              (index === 0 || index === 1) ? "col-span-6" : "col-span-4"
            )}>
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
              <h3 className="text-center font-bold">{category.name}</h3>
            </Link>
          ))}
        </div>

        {/* MOBILE VIEW */}
        <div className="flex lg:hidden gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px">
          {categories.map((category) => (
            <Link href='/' key={category.id} className="flex flex-col gap-2">
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
      
      <section className="mt-20">
        <h3 className="text-2xl font-bold text-center md:text-start">Flash Sale Products</h3>
        <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px">
          {products.map((product) => {
            return(
              <ProductCard
                key={product.slug}
                categoryName={product.categories[0].name}
                discount={product.discount}
                image={product.images[0]}
                name={product.name}
                price={product.price}
                rating={product.rating}
                slug={product.slug}
                banner={product.banner!}
                category={product.categories}
              />
            )
          })}
        </div>
      </section>
      
      <section>
        <div className="flex flex-col w-full md:w-96 mx-auto mb-5 mt-10">
          <h3 className="text-4xl font-bold text-center mt-20">Kolibri Breastpump</h3>
          <p className="text-center w-full text-sm text-neutral-400">Effortless and comfortable pumping with Kolibri! Portable, gentle, and designed for modern moms.</p>
        </div>
        <hr className="mb-3 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"/>
          <video autoPlay loop muted playsInline className="w-full h-auto">
            <source src="/home-video.mp4" type="video/mp4"/>
          </video>
        </div>

        <div className="flex gap-1 mt-10 md:gap-5 overflow-scroll no-scrollbar">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              categoryName={product.categories[0].name}
              discount={product.discount}
              image={product.images[0]}
              name={product.name}
              price={product.price}
              rating={product.rating}
              slug={product.slug}
              banner={product.banner!}
              category={product.categories}
            />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h3 className="md:text-2xl text-xl font-bold text-center md:text-start">Shop by New Arrival Products</h3>
        <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex flex-col md:flex-row gap-10 md:gap-2">
          {newArrival.map((product) => (
            <Link href={`/products/${product.slug}`} key={product.slug} className="w-full">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={500}
                height={500}
                className="w-full min-h-[700px] max-h-[700px] object-cover"
              />
              <h2 className="text-center mt-2 text-xl">{product.name}</h2>
              <h3 className="text-center">Rp{product.price.toLocaleString()}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col w-full md:w-96 mx-auto mb-5">
          <h2 className="text-4xl font-bold text-center">GabaG Beauty</h2>
          <p className="text-center w-full text-sm text-neutral-400">A stylish storage solution for your beauty essentials! Practical, elegant, and ready to accompany your daily routine.</p>
        </div>
        <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar px-1">
          {beauty.map((product) => (
            <ProductCard
              key={product.slug}
              categoryName={product.categories[0].name}
              discount={product.discount}
              image={product.images[0]}
              name={product.name}
              price={product.price}
              rating={product.rating}
              slug={product.slug}
              banner={product.banner!}
              category={product.categories}
            />
          ))}
        </div>
      </section>

      <section>

      </section>
    </div>
  );
};

export default HomePage;
