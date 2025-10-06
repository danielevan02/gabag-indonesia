import ProductDetailSection from "./components/product-detail-section";
import { Metadata } from "next";
import { trpc } from "@/trpc/server";
import { Suspense, cache } from "react";
import RelatedProducts, { RelatedProductsFallback } from "./components/related-products";

type tParams = Promise<{ slug: string }>;

// Cache product fetching to avoid duplicate requests in same render
const getProduct = cache(async (slug: string) => {
  return await trpc.product.getBySlug({ slug });
});

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
    const product = await getProduct(slug);

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
  const product = await getProduct(slug);

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="flex flex-col px-5 w-full max-w-screen mt-10">
      <ProductDetailSection product={product} />

      <Suspense fallback={<RelatedProductsFallback />}>
        <RelatedProducts subCategoryName={product.subCategory.name} />
      </Suspense>
    </div>
  );
};

export default ProductDetailsPage;
