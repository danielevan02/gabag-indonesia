import ProductCard from "@/components/shared/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { PRODUCT_LIST_LIMIT } from "@/lib/constants";
import { trpc } from "@/trpc/server";
import ProductPagination from "./product-pagination";

interface ProductListProps {
  search?: string;
  subCategoryIds?: string[];
  categoryId?: string;
  sort?: string;
  max?: string;
  min?: string;
  page?: string;
}

const ProductList = async ({
  search,
  max,
  min,
  subCategoryIds,
  categoryId,
  page,
}: ProductListProps) => {
  // If no subCategoryIds provided, fetch from category
  let subCategoriesId = subCategoryIds;

  if ((!subCategoryIds || subCategoryIds.length === 0) && categoryId) {
    const category = await trpc.category.getById({ id: categoryId });
    subCategoriesId = category?.subCategories.map((sub) => sub.id);
  }

  const result = await trpc.product.getAll({
    search,
    subCategoriesId,
    price: {
      max,
      min,
    },
    limit: PRODUCT_LIST_LIMIT,
    page: Number(page) || 1,
  });

  const { products, currentPage, totalPages } = result;

  return (
    <>
      <div className="grid w-full gap-2 md:gap-5 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-full">
        {products && products.length !== 0 ? (
          products.map((product) => (
            <ProductCard key={product.slug} className="col-span-1" {...product} />
          ))
        ) : (
          <p className="text-lg text-neutral-500 text-center mt-36 col-span-4">
            There is no products.
          </p>
        )}
      </div>
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
};

export const ProductListFallback = () => {
  return (
    <div
      className={`
        grid 
        w-full 
        gap-2 
        md:gap-5 
        grid-cols-2 
        lg:grid-cols-4
        h-full
      `}
    >
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} className="col-span-1 aspect-[1/1.9]" />
      ))}
    </div>
  );
};

export default ProductList;
