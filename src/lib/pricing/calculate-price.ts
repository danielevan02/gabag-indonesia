import prisma from "@/lib/prisma";

export interface PriceDiscount {
  type: 'SELLER_DISCOUNT' | 'CAMPAIGN';
  label: string;
  amount: number;
  percentage?: number | null;
  campaignType?: string;
  endsAt?: Date;
}

export interface ProductPricing {
  regularPrice: number;
  finalPrice: number;
  totalSavings: number;
  discounts: PriceDiscount[];
  activeCampaign?: {
    id: string;
    name: string;
    type: string;
    endsAt: Date;
    stockAvailable: boolean;
  } | null;
}

/**
 * Calculate product final price dengan sistem hybrid:
 * 1. Apply product's permanent discount (seller discount)
 * 2. Apply BEST campaign discount (highest priority & still has stock)
 *
 * Priority fitur:
 * - Custom discount per product dalam campaign
 * - Stock limit per product dalam campaign
 * - Auto schedule (cron job akan handle isActive)
 */
export async function calculateProductPrice(productId: string): Promise<ProductPricing> {
  const now = new Date();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      campaignItems: {
        where: {
          campaign: {
            startDate: { lte: now },
            OR: [
              { endDate: { gte: now } },
              { endDate: null as any }
            ]
          }
        },
        include: {
          campaign: true
        }
      }
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  let currentPrice = Number(product.regularPrice);
  const discounts: PriceDiscount[] = [];

  // 1. Apply product's permanent discount (seller discount)
  if (product.discount && product.discount > 0) {
    const sellerDiscount = (currentPrice * product.discount) / 100;
    currentPrice -= sellerDiscount;
    discounts.push({
      type: 'SELLER_DISCOUNT',
      label: 'Diskon Toko',
      amount: Math.round(sellerDiscount),
      percentage: product.discount
    });
  }

  // 2. Apply BEST campaign discount (highest priority with stock available)
  let activeCampaignInfo = null;

  for (const productCampaign of product.campaignItems) {
    // Check stock availability
    const hasStockLimit = productCampaign.stockLimit !== null;
    const stockAvailable = hasStockLimit
      ? productCampaign.soldCount < productCampaign.stockLimit!
      : true;

    if (!stockAvailable) {
      continue; // Skip this campaign, try next priority
    }

    // Use custom discount or default campaign discount
    const discountValue = productCampaign.customDiscount
      ?? productCampaign.campaign.defaultDiscount;

    const discountType = productCampaign.customDiscountType
      ?? productCampaign.campaign.discountType;

    // Calculate campaign discount
    let campaignDiscount = 0;
    if (discountType === 'PERCENT') {
      campaignDiscount = (currentPrice * discountValue) / 100;
    } else {
      // FIXED amount
      campaignDiscount = Math.min(discountValue, currentPrice); // Don't exceed current price
    }

    currentPrice -= campaignDiscount;
    discounts.push({
      type: 'CAMPAIGN',
      label: productCampaign.campaign.name,
      campaignType: productCampaign.campaign.type,
      amount: Math.round(campaignDiscount),
      percentage: discountType === 'PERCENT' ? discountValue : null,
      endsAt: productCampaign.campaign.endDate || undefined
    });

    // Set active campaign info
    activeCampaignInfo = {
      id: productCampaign.campaign.id,
      name: productCampaign.campaign.name,
      type: productCampaign.campaign.type as string,
      endsAt: productCampaign.campaign.endDate || new Date(),
      stockAvailable: stockAvailable
    };

    // Only apply the best (highest priority) campaign
    break;
  }

  return {
    regularPrice: Number(product.regularPrice),
    finalPrice: Math.max(0, Math.round(currentPrice)),
    totalSavings: Math.round(Number(product.regularPrice) - currentPrice),
    discounts,
    activeCampaign: activeCampaignInfo
  };
}

/**
 * Calculate prices for multiple products (batch operation)
 * Useful untuk product list/grid
 */
export async function calculateProductPrices(productIds: string[]): Promise<Record<string, ProductPricing>> {
  const pricings = await Promise.all(
    productIds.map(id => calculateProductPrice(id))
  );

  return productIds.reduce((acc, id, index) => {
    acc[id] = pricings[index];
    return acc;
  }, {} as Record<string, ProductPricing>);
}

/**
 * Check if product is available in campaign (has stock)
 */
export async function checkCampaignStockAvailability(
  campaignId: string,
  productId: string
): Promise<boolean> {
  const campaignItem = await prisma.campaignItem.findFirst({
    where: {
      productId,
      campaignId,
      variantId: null // Only check product-level, not variant
    }
  });

  if (!campaignItem) {
    return false;
  }

  // If no stock limit, always available
  if (campaignItem.stockLimit === null) {
    return true;
  }

  // Check if still has stock
  return campaignItem.soldCount < campaignItem.stockLimit;
}
