import { trpc } from "@/trpc/server";
import FilterProduct from "./filter-product";
import MobileFilterProduct from "./mobile-filter-product";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterWrapperProps {
  categoryId?: string; // Optional: undefined = all categories
  initialSelectedSubCategories?: string[];
}

const FilterWrapper = async ({ categoryId, initialSelectedSubCategories }: FilterWrapperProps) => {
  // If categoryId is undefined, getSelect will return all subcategories from all categories
  const subCategoryList = await trpc.subCategory.getSelect(categoryId);

  return (
    <>
      <FilterProduct
        subCategories={subCategoryList}
        initialSelectedSubCategories={initialSelectedSubCategories}
      />

      <MobileFilterProduct
        subCategories={subCategoryList}
        initialSelectedSubCategories={initialSelectedSubCategories}
      />
    </>
  );
};

export const FilterWrapperFallback = () => {
  return (
    <>
      {/* Desktop Filter Skeleton */}
      <div className="hidden md:block md:w-64 lg:w-72">
        <Skeleton className="h-96 w-full" />
      </div>

      {/* Mobile Filter Skeleton */}
      <div className="md:hidden w-full mb-4">
        <Skeleton className="h-10 w-full" />
      </div>
    </>
  );
};

export default FilterWrapper;
