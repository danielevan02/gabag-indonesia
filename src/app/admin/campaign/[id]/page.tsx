import { trpc } from "@/trpc/server";
import CampaignEditForm from "./components/campaign-edit-form";
import { notFound } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function EditCampaignPage({ params }: { params: Params }) {
  const { id } = await params;

  try {
    const [campaign, productData] = await Promise.all([
      trpc.campaign.getById({ id }),
      trpc.product.getAll({ page: 1, limit: 1000 }),
    ]);

    if (!campaign) {
      notFound();
    }

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

    // Serialize campaign data to plain objects
    const serializedCampaign = {
      ...campaign,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      items: campaign.items.map(item => ({
        ...item,
        customDiscount: item.customDiscount ?? undefined,
        customDiscountType: item.customDiscountType ?? undefined,
        stockLimit: item.stockLimit ?? undefined,
        variantId: item.variantId ?? undefined,
      })),
    };

    return (
      <div className="p-5 h-full max-h-screen flex flex-col overflow-hidden">
        <div className="mb-5">
          <h1 className="text-2xl font-bold">Edit Campaign</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update campaign settings, discounts, and product selections
          </p>
        </div>

        <CampaignEditForm campaign={serializedCampaign} products={productList} />
      </div>
    );
  } catch {
    notFound();
  }
}
