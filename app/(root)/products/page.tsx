import FilterProduct from "./components/filter-product";
import MobileFilterProduct from "./components/mobile-filter-product";
import { Metadata } from "next";
import { getCategory } from "@/lib/actions/category.action";
import { getSubCategories } from "@/lib/actions/subCategory.action";
import ProductList, { ProductListFallback } from "./components/product-list";
import { Suspense } from "react";
import BlurImage from "@/components/shared/blur-image";

export const metadata: Metadata={
  title: 'Products',
  description: "Discover GabaG's complete product collection, including ASI cooler bags, multifunctional bags, ice gel packs, and breastfeeding accessories. Get the best deals now!"
}

const ProductPage = async ({searchParams}: {
  searchParams: Promise<{
    subCategories: string;
    search: string;
    sort: string;
    min: string;
    max: string;
    category: string;
  }>
}) => {
  const {subCategories, search, max, min, sort, category} = await searchParams
  const subCategoryIds = subCategories?.split(',')

  const categories = await getCategory(category)
  
  const subCategoryList = await getSubCategories(categories?.id||"")
  
  return (
    <div className="mx-3 xl:mx-10 flex flex-col items-center">

      <div className="flex justify-center mt-2 mb-10 w-full h-40 md:h-96 xl:h-[460px]">
        <BlurImage
          src={categories?.image||""}
          width={700}
          height={700}
          alt={categories?.name||"category photo"}
          className="h-full w-full lg:w-[80%] object-cover"
          dynamic
          priority
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

          <Suspense fallback={<ProductListFallback/>}>
            <ProductList
              subCategoryIds={subCategoryIds||categories?.subCategories.map((sub) => sub.id)}
              search={search}
              max={max}
              min={min}
              sort={sort}
            />
          </Suspense>

        </div>
      </div>
    </div>
  );
}
 
export default ProductPage;