import { getAllProducts, getProductBySlug } from "@/lib/actions/product.action";
import ProductDetailSection from "./components/product-detail-section";
import { Metadata } from "next";
import { FullProductType } from "@/types";
import ProductCard from "@/components/shared/product/product-card";

type tParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: {params: tParams}): Promise<Metadata> {
  const { slug }: {slug: string} = await params;
  const product = await getProductBySlug(slug);

  return {
    title: product?.name || "Product Details",
    description: product?.description || "Find more information about this product.",
  };
}
const ProductDetailsPage = async ({ params }: {params: tParams}) => {
  const { slug }: {slug: string} = await params;
  const product = await getProductBySlug(slug);
  const products = await getAllProducts(product.categories?.[0].name)
  
  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="flex flex-col px-5 w-full max-w-screen mt-10">
      <ProductDetailSection 
        product={product as FullProductType} 
      />

      {products && (
        <div className="mt-10">
          <p className="text-lg lg:text-2xl">You Might Also Like</p>
          <div className="flex gap-1 mt-5 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory py-px">
            {products.map((product) => (
              <ProductCard
                key={product.slug}
                {...product}
                categoryName={product.categories[0].name}
                image={product.images[0]}
                category={product.categories}
                banner={product.banner!}
                className={`
                min-w-56 
                max-w-56 
                md:min-w-80 
                md:max-w-80 
                lg:min-w-96
                lg:max-w-96
                snap-start
              `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
