import ProductCard from "@/components/shared/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllProducts } from "@/lib/actions/product.action";

interface ProductListProps {
  search?: string
  subCategoryIds?: string[]
  sort?: string
  max?: string 
  min?: string
}

const ProductList = async ({search, max, min, sort, subCategoryIds}: ProductListProps) => {
  const products = await getAllProducts(undefined, search, subCategoryIds, sort, {max, min})
  return (
    <div
      className={`
        grid 
        w-full 
        gap-2 
        md:gap-5 
        grid-cols-2 
        lg:grid-cols-3
        xl:grid-cols-4
        h-full
      `}
    >
      {products && products?.length !== 0 ? (
        products.map((product) => (
          <ProductCard
            key={product.slug}
            {...product}
            image={product.images[0]}
            subCategory={product.subCategory!}
            className="col-span-1"
          />
        ))
      ) : (
        <p className="text-lg text-neutral-500 text-center mt-36 col-span-3">
          There is no products.
        </p>
      )}
    </div>
  );
};

export const ProductListFallback = () => {
  return(
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
      {[...Array(6)].map((_, index) => (
        <Skeleton key={index} className="col-span-1 min-w-sm aspect-[1/1.7]"/>
      ))}
    </div>
  )
}

export default ProductList;
