import { trpc } from "@/trpc/server";
import CampaignForm from "./components/campaign-form";

export default async function AddCampaignPage() {
  const productData = await trpc.product.getAll({ page: 1, limit: 1000 });

  const productList = productData.products.map((product) => ({
    id: product.id,
    name: product.name,
    regularPrice: product.regularPrice,
    stock: product.stock,
    hasVariant: product.hasVariant,
    variants: product.variants?.map((variant) => ({
      id: variant.id,
      name: variant.name,
      regularPrice: variant.regularPrice,
      stock: variant.stock,
    })) || [],
  }));

  return (
    <div className="p-5 h-full max-h-screen flex flex-col overflow-hidden">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Create New Campaign</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up a new promotional campaign with custom discounts and scheduling
        </p>
      </div>

      <CampaignForm products={productList} />
    </div>
  );
}
