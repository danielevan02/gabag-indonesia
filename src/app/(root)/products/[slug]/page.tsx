import ProductDetailSection from "./components/product-detail-section";
import { Metadata } from "next";
import ProductCard from "@/components/shared/product-card";
import { trpc } from "@/trpc/server";

type tParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  try {
    return trpc.product.getAllSlug()
  } catch (error) {
    console.error('Failed to generate static params for products:', error);
    return [];
  }
}

export async function generateMetadata({ params }: {params: tParams}): Promise<Metadata> {
  try {
    const { slug }: {slug: string} = await params;
    const product = await trpc.product.getBySlug({slug});

    return {
      title: product?.name || "Product Details",
      description: product?.description || "Find more information about this product.",
    };
  } catch (error) {
    // Fallback metadata if product fetch fails
    console.error('Failed to fetch product for metadata:', error);
    return {
      title: "Product Details",
      description: "Find more information about this product.",
    };
  }
}
const ProductDetailsPage = async ({ params }: {params: tParams}) => {
  const { slug }: {slug: string} = await params;
  const product = await trpc.product.getBySlug({slug});
  const result = await trpc.product.getAll({subCategory: product.subCategory.name})

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="flex flex-col px-5 w-full max-w-screen mt-10">
      <ProductDetailSection product={product} />

      {result.products && result.products.length > 0 && (
        <div className="mt-10">
          <p className="text-lg lg:text-2xl">You Might Also Like</p>
          <div className="flex gap-1 mt-5 md:gap-5 overflow-scroll no-scrollbar snap-x snap-mandatory py-px">
            {result.products.map((product) => (
              <ProductCard
                {...product}
                key={product.slug}
                className="product-card-container"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
