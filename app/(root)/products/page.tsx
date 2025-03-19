import ProductCard from "@/components/shared/product/product-card";
import { getAllCategories, getAllProducts } from "@/lib/actions/product.action";
import FilterProduct from "./components/filter-product";
import MobileFilterProduct from "./components/mobile-filter-product";

const ProductPage = async () => {
  const products = await getAllProducts() || []
  const categories = await getAllCategories()
  return (
    <div className="flex items-start relative flex-col md:flex-row justify-between mx-3 lg:mx-10 gap-5">
      <FilterProduct categories={categories}/>

      <MobileFilterProduct categories={categories}/>

      <div className="flex w-full gap-2 flex-wrap justify-between md:justify-normal">
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
            className="md:max-w-[410px] max-w-40 min-w-40 justify-between"
          />
        ))}
      </div>
    </div>
  );
}
 
export default ProductPage;