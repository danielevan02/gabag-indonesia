import ProductCard from "@/components/shared/product/product-card";
import { getAllProducts } from "@/lib/actions/product.action";

import FilterProduct from "./components/filter-product";
import MobileFilterProduct from "./components/mobile-filter-product";
import { Metadata } from "next";
import Image from "next/image";
import { getCategory } from "@/lib/actions/category.action";
import { getSubCategories } from "@/lib/actions/subCategory.action";

export const metadata: Metadata={
  title: 'Products',
  description: "Discover GabaG's complete product collection, including ASI cooler bags, multifunctional bags, ice gel packs, and breastfeeding accessories. Get the best deals now!"
}

const ProductPage = async ({searchParams}: {
  searchParams: Promise<{
    subCategories: string;
    search: string;
    banner: string;
    sort: string;
    min: string;
    max: string;
    category: string;
  }>
}) => {
  const {subCategories, search, banner, max, min, sort, category} = await searchParams
  const subCategoryIds = subCategories?.split(',')

  const categories = await getCategory(category)
  
  const [products, subCategoryList] = await Promise.all([
    getAllProducts(undefined, search, subCategoryIds||categories?.subCategories.map((sub) => sub.id), banner, sort, {max, min}),
    getSubCategories(categories?.id||""),
  ])
  
  return (
    <div className="mx-3 xl:mx-10 flex flex-col items-center">

      <div className="flex justify-center mt-2 mb-10 w-full h-40 md:h-96 xl:h-[460px]">
        <Image
          src={categories?.image||""}
          width={1000}
          height={1000}
          alt={categories?.name||"category photo"}
          className="h-full w-full lg:w-[80%] object-cover"
        />
      </div>

      <div className="flex items-start w-full relative flex-col md:flex-row justify-between lg:gap-5 min-h-[500px]">
        <FilterProduct subCategories={subCategoryList}/>
        
        <MobileFilterProduct subCategories={subCategoryList}/>
        
        <div className="flex flex-col w-full h-full">
          {search && (
            <p className="mb-3">
              Showing results for <span className="font-bold">&quot;{search}&quot;</span>
            </p>
          )}
          <div 
            className={`
              grid 
              w-full 
              gap-2 
              md:gap-5 
              grid-cols-2 
              lg:grid-cols-3
              h-full
              `}
          >
            { products && (products?.length !== 0) ? products.map((product) => (
              <ProductCard
                key={product.slug}
                {...product}
                image={product.images[0]}
                subCategory={product.subCategory!}
                className="col-span-1"
              />
              )):(
                <p className="text-lg text-neutral-500 text-center mt-36 col-span-3">There is no products.</p>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
 
export default ProductPage;