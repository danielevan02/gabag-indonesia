import ProductCard from "@/components/shared/product/product-card";
import HomeCarousel from "./components/home-carousel";
import { Metadata } from "next";
import Image from "next/image";
import { getAllProducts, getNewArrivalProduct } from "@/lib/actions/product.action";
import Link from "next/link";
import CategorySection from "./components/category-section";
import { Suspense } from "react";

export const metadata: Metadata = {
  description: 'Temukan Gabag! pompa ASI dan tas cooler premium untuk ibu modern. Praktis, stylish, dan sempurna untuk kebutuhan menyusui di mana saja!',
  openGraph: {
    type: 'website'
  }
}

const HomePage = async () => {
  const [products, beauty, newArrival] = await Promise.all([
    getAllProducts() || [],
    getAllProducts("Beauty") || [],
    getNewArrivalProduct()
  ])
  return (
    <div className="flex flex-col w-full max-w-screen px-2 md:px-5 lg:px-10">
      <HomeCarousel slideDuration={5000} />

      <Suspense>
        <CategorySection/>
      </Suspense>
      
      <section className="mt-20">
        <h3 className="text-2xl text-center md:text-start">Flash Sale Products</h3>
        <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory px-1 py-px ">
          {products.map((product) => {
            return(
              <ProductCard
                key={product.slug}
                {...product}
                categoryName={product.categories[0].name}
                image={product.images[0]}
                category={product.categories}
                banner={product.banner!}
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
            )
          })}
        </div>
      </section>
      
      <section>
        <div className="flex flex-col w-full md:w-[460px] mx-auto mb-5 mt-10 gap-2">
          <h3 className="text-2xl lg:text-4xl font-bold text-center mt-20">Kolibri Breastpump</h3>
          <p className="text-center w-full text-xs lg:text-sm text-neutral-400">Effortless and comfortable pumping with Kolibri! Portable, gentle, and designed for modern moms.</p>
        </div>
        <hr className="mb-3 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />

        <div className="relative">
          <div className="absolute inset-0 -bottom-1 bg-gradient-to-b from-transparent via-transparent to-background"/>
          <video autoPlay loop muted playsInline className="w-screen h-screen object-cover">
            <source src="/home-video.mp4" type="video/mp4"/>
          </video>
        </div>

        <div className="flex gap-1 mt-10 md:gap-5 overflow-scroll no-scrollbar py-px snap-x snap-mandatory">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              {...product}
              categoryName={product.categories[0].name}
              image={product.images[0]}
              category={product.categories}
              banner={product.banner!}
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

      <section className="mt-20 lg:px-20">
        <h3 className="md:text-2xl text-xl text-center md:text-start">Shop by New Arrival Products</h3>
        <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex flex-col md:flex-row gap-10 md:gap-5 lg:gap-5">
          {newArrival.map((product) => (
            <Link href={`/products/${product.slug}`} key={product.slug} className="w-full flex flex-col items-center">
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
              <h2 className="text-center mt-5 lg:text-xl font-semibold tracking-widest w-72 lg:w-96">{product.name}</h2>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col w-full md:w-96 mx-auto mb-5">
          <h2 className="text-2xl lg:text-4xl font-bold text-center">GabaG Beauty</h2>
          <p className="text-center w-full text-xs lg:text-sm text-neutral-400">A stylish storage solution for your beauty essentials! Practical, elegant, and ready to accompany your daily routine.</p>
        </div>
        <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px snap-x snap-mandatory">
          {beauty.map((product) => (
            <ProductCard
              key={product.slug}
              {...product}
              categoryName={product.categories[0].name}
              image={product.images[0]}
              category={product.categories}
              banner={product.banner!}
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

      <section>

      </section>
    </div>
  );
};

export default HomePage;
