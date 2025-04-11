import { getAllProducts, getProductBySlug } from "@/lib/actions/product.action";
import ProductDetailSection from "./components/product-detail-section";
import { Metadata } from "next";

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

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="flex flex-col px-5 w-full max-w-screen">
      <ProductDetailSection 
        product={{
          ...product, 
          weight: Number(product.weight),
          length: Number(product.length),
          width: Number(product.width),
          height: Number(product.height),
        }} 
      />
      <div></div>
    </div>
  );
};

export default ProductDetailsPage;
