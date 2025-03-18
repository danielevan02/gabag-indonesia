import { getProductBySlug } from "@/lib/actions/product.action"

const ProductDetailsPage = async (props: {
  params: Promise<{slug: string}>
}) => {
  const {slug} = await props.params
  const product = await getProductBySlug(slug)

  return(
    <div>
      {product?.name}
    </div>
  )
}

export default ProductDetailsPage