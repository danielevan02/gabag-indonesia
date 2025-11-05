/**
 * Centralized pricing service for consistent price calculations across the application
 */

import prisma from "@/lib/prisma";
import { CartItem } from "@/types";

/**
 * Round price consistently across the application
 */
export function roundPrice(price: number): number {
  return Math.round(price);
}

/**
 * Calculate tax price (1% of items price)
 */
export function calculateTax(itemsPrice: number): number {
  return roundPrice(0.01 * itemsPrice);
}

/**
 * Get active campaign for a product/variant
 */
export async function getActiveProductCampaign(
  productId: string,
  variantId?: string | null
) {
  const now = new Date();

  return await prisma.campaignItem.findFirst({
    where: {
      productId,
      variantId: variantId || null,
      campaign: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
    },
    include: {
      campaign: true,
    },
    orderBy: {
      campaign: {
        priority: "desc",
      },
    },
  });
}

/**
 * Calculate final price for a product/variant with campaign discount
 */
export async function calculateProductPrice(
  productId: string,
  regularPrice: number,
  variantId?: string | null
): Promise<{
  regularPrice: number;
  finalPrice: number;
  discount: number;
  campaignId?: string;
  campaignName?: string;
}> {
  // Check for active campaign
  const campaignItem = await getActiveProductCampaign(productId, variantId);

  if (!campaignItem) {
    return {
      regularPrice,
      finalPrice: regularPrice,
      discount: 0,
    };
  }

  // Calculate discount
  let discount = 0;
  if (campaignItem.campaign.discountType === "PERCENT") {
    const discountPercent =
      campaignItem.customDiscount ?? campaignItem.campaign.defaultDiscount;
    discount = roundPrice((regularPrice * discountPercent) / 100);
  } else if (campaignItem.campaign.discountType === "FIXED") {
    discount =
      campaignItem.customDiscount ?? campaignItem.campaign.defaultDiscount;
  }

  const finalPrice = Math.max(0, regularPrice - discount);

  return {
    regularPrice,
    finalPrice,
    discount,
    campaignId: campaignItem.campaign.id,
    campaignName: campaignItem.campaign.name,
  };
}

/**
 * Calculate prices for multiple cart items
 */
export async function calculateCartItemsPrices(items: CartItem[]): Promise<{
  itemsPrice: number;
  taxPrice: number;
  totalPrice: number;
  itemsWithPrices: Array<
    CartItem & {
      regularPrice: number;
      finalPrice: number;
      discount: number;
      lineTotal: number;
      campaignId?: string;
    }
  >;
}> {
  const itemsWithPrices = await Promise.all(
    items.map(async (item) => {
      // Get product/variant data
      let regularPrice: number;

      if (item.variantId) {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
          select: { regularPrice: true },
        });
        regularPrice = Number(variant?.regularPrice || 0);
      } else {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { regularPrice: true },
        });
        regularPrice = Number(product?.regularPrice || 0);
      }

      // Calculate price with campaign
      const priceInfo = await calculateProductPrice(
        item.productId,
        regularPrice,
        item.variantId
      );

      const lineTotal = priceInfo.finalPrice * item.qty;

      return {
        ...item,
        regularPrice: priceInfo.regularPrice,
        finalPrice: priceInfo.finalPrice,
        discount: priceInfo.discount,
        lineTotal,
        campaignId: priceInfo.campaignId,
      };
    })
  );

  const itemsPrice = itemsWithPrices.reduce(
    (sum, item) => sum + item.lineTotal,
    0
  );
  const taxPrice = calculateTax(itemsPrice);
  const totalPrice = itemsPrice + taxPrice;

  return {
    itemsPrice: roundPrice(itemsPrice),
    taxPrice,
    totalPrice: roundPrice(totalPrice),
    itemsWithPrices,
  };
}

/**
 * Validate cart prices match expected total
 * Returns true if prices are valid, false otherwise
 */
export async function validateCartPrices(
  items: CartItem[],
  expectedTotal: number,
  tolerance: number = 1 // Allow 1 unit difference for rounding
): Promise<{ valid: boolean; actualTotal: number; difference: number }> {
  const { totalPrice: actualTotal } = await calculateCartItemsPrices(items);
  const difference = Math.abs(actualTotal - expectedTotal);

  return {
    valid: difference <= tolerance,
    actualTotal,
    difference,
  };
}

/**
 * Calculate order total with shipping
 */
export function calculateOrderTotal(
  itemsPrice: number,
  taxPrice: number,
  shippingPrice: number,
  discountAmount: number = 0
): number {
  const total = itemsPrice + taxPrice + shippingPrice - discountAmount;
  return roundPrice(Math.max(0, total));
}
