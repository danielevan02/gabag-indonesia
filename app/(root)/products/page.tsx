import ProductCard from "@/components/shared/product/product-card";
import { getAllCategories, getAllProducts } from "@/lib/actions/product.action";
import FilterProduct from "./components/filter-product";
import MobileFilterProduct from "./components/mobile-filter-product";
import { Metadata } from "next";

export const metadata: Metadata={
  title: 'Products'
}

const ProductPage = async ({searchParams}: {
  searchParams: Promise<{
    categories: string;
    search: string;
    banner: string;
    sort: string;
    min: string;
    max: string;
  }>
}) => {
  const {categories, search, banner, max, min, sort} = await searchParams
  const categoryIds = await categories?.split(',')
  const products = await getAllProducts(undefined, search, categoryIds, banner, sort, {max, min})
  const categoryList = await getAllCategories()
  return (
    <div className="flex items-start relative flex-col md:flex-row justify-between mx-3 lg:mx-10 gap-5 min-h-screen h-full">
      <FilterProduct categories={categoryList}/>
      
      <MobileFilterProduct categories={categoryList}/>
      
      <div className="flex flex-col w-full h-full">
        {search && (
          <p className="mb-3">
            Showing results for <span className="font-bold">&quot;{search}&quot;</span>
          </p>
        )}
        <div className="grid w-full gap-2 md:gap-5 md:grid-cols-3 grid-cols-2 h-full">
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
              className="col-span-1 md:max-w-xl min-w-40"
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