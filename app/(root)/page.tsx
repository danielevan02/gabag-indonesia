import ProductCard from "@/components/shared/product/product-card";
import HomeCarousel from "./components/home-carousel";
import { products } from "@/lib/data";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Temukan Gabag! pompa ASI dan tas cooler premium untuk ibu modern. Praktis, stylish, dan sempurna untuk kebutuhan menyusui di mana saja!'
}

const HomePage = () => {
  return (
    <div className="flex flex-col mx-5 mt-32">
      <HomeCarousel slideDuration={5000} />
      
      <section className="mt-20">
        <h3 className="text-2xl font-bold text-center md:text-start">Flash Sale Products</h3>
        <hr className="mb-5 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex gap-1 md:gap-5 overflow-scroll no-scrollbar px-1 py-px">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              category={product.category}
              discount={product.discount}
              image={product.image}
              name={product.name}
              price={product.price}
              rating={product.rating}
              slug={product.slug}
            />
          ))}
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
              category={product.category}
              discount={product.discount}
              image={product.image}
              name={product.name}
              price={product.price}
              rating={product.rating}
              slug={product.slug}
            />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h3 className="md:text-2xl text-xl font-bold text-center md:text-start">Shop by New Arrival Products</h3>
        <hr className="mb-2 h-px border-t-0 bg-transparent bg-gradient-to-r from-transparent via-neutral-900 to-transparent opacity-25 dark:via-white" />
        <div className="flex flex-col md:flex-row gap-10 md:gap-2">
          {products.slice(0, 2).map((product) => (
            <div key={product.slug} className="w-full">
              <Image
                src={product.image}
                alt={product.name}
                width={500}
                height={500}
                className="w-full"
              />
              <h2 className="text-center mt-2 text-xl">{product.name}</h2>
              <h3 className="text-center">Rp{product.price.toLocaleString()}</h3>
            </div>
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
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              category={product.category}
              discount={product.discount}
              image={product.image}
              name={product.name}
              price={product.price}
              rating={product.rating}
              slug={product.slug}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
