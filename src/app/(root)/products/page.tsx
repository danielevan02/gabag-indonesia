import { Metadata } from "next";
import ProductList, { ProductListFallback } from "./components/product-list";
import { Suspense } from "react";
import CategoryBanner, { CategoryBannerFallback } from "./components/category-banner";
import FilterWrapper, { FilterWrapperFallback } from "./components/filter-wrapper";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Discover GabaG's complete product collection, including ASI cooler bags, multifunctional bags, ice gel packs, and breastfeeding accessories. Get the best deals now!",
};

// Revalidate every 1 minute to sync with campaign updates
// This ensures campaign prices update quickly when campaigns activate
export const revalidate = 60;

const ProductPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    subCategories: string;
    search: string;
    sort: string;
    min: string;
    max: string;
    category: string;
    page: string;
  }>;
}) => {
  const { subCategories, search, max, min, sort, category, page } = await searchParams;
  const subCategoryIds = subCategories?.split(",").filter(Boolean);

  return (
    <div className="mx-3 xl:mx-10 flex flex-col items-center">
      <Suspense key={`banner-${category}`} fallback={<CategoryBannerFallback />}>
        <CategoryBanner categoryId={category} />
      </Suspense>

      <div className="flex items-start w-full relative flex-col md:flex-row justify-between lg:gap-5 min-h-[500px]">
        <Suspense key={`filter-${category}`} fallback={<FilterWrapperFallback />}>
          <FilterWrapper
            categoryId={category}
            initialSelectedSubCategories={subCategoryIds}
          />
        </Suspense>

        <div className="flex flex-col w-full h-full">
          {search && (
            <p className="mb-3">
              Showing results for <span className="font-bold">&quot;{search}&quot;</span>
            </p>
          )}

          <Suspense key={`products-${category}-${subCategoryIds?.join(',') || 'all'}-${search || ''}-${page || '1'}`} fallback={<ProductListFallback />}>
            <ProductList
              subCategoryIds={subCategoryIds}
              categoryId={category}
              search={search}
              max={max}
              min={min}
              sort={sort}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
