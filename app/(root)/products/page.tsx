import ProductCard from "@/components/shared/product/product-card";
import { getAllCategories, getAllProducts } from "@/lib/actions/product.action";
import FilterProduct from "./components/filter-product";
import MobileFilterProduct from "./components/mobile-filter-product";

const ProductPage = async ({searchParams}: {
  searchParams: Promise<{
    categories: string;
    search: string;
  }>
}) => {
  const {categories, search} = await searchParams
  const categoryIds = await categories?.split(',')
  const products = await getAllProducts(undefined, search, categoryIds)
  const categoryList = await getAllCategories()
  return (
    <div className="flex items-start relative flex-col md:flex-row justify-between mx-3 lg:mx-10 gap-5 h-screen">
      <FilterProduct categories={categoryList}/>
      
      <MobileFilterProduct categories={categoryList}/>
      
      <div className="flex flex-col w-full h-full">
        {search && (
          <p className="mb-3">
            Showing results for <span className="font-bold">&quot;{search}&quot;</span>
          </p>
        )}
        <div className="flex w-full gap-2 flex-wrap justify-between md:justify-normal h-full">
          { products && (products?.length !== 0) ? products.map((product) => (
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
            )):(
              <p className="font-bold text-lg text-neutral-500 m-auto my-auto">There is no products.</p>
            )
          }
        </div>
      </div>
    </div>
  );
}
 
export default ProductPage;