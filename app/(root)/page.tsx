import ProductCard from "@/components/shared/product/product-card";
import HomeCarousel from "./components/home-carousel";
import { products } from "@/lib/data";

const HomePage = () => {
  return (
    <div className="flex flex-col mx-5 mt-32">
      <HomeCarousel slideDuration={5000} />
      
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-center md:text-start">Flash Sale Products</h2>
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
        <div className="flex flex-col w-full md:w-1/4 mx-auto mb-5 mt-10">
          <h2 className="text-4xl font-bold text-center mt-20">GabaG Beauty</h2>
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
