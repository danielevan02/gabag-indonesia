import { getAllProducts, getProductBySlug } from "@/lib/actions/product.action"
import ProductDetailSection from "./components/product-detail-section";

export async function generateStaticParams(){
  const products = await getAllProducts()

  return products.map((product)=>({slug: product.slug}))
}

const ProductDetailsPage = async ({params}:{params: {slug: string;}}) => {
  const slug = params.slug
  const product = await getProductBySlug(slug)
  
  return(
    <div className="flex flex-col px-5 w-full max-w-screen">
      <ProductDetailSection product={product!} />

      <div>

      </div>
    </div>
  )
}

export default ProductDetailsPage