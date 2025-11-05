/**
 * Order service - Handles order business logic
 */

import prisma from "@/lib/prisma";
import { CartItem } from "@/types";
import { calculateCartItemsPrices, validateCartPrices } from "./pricing.service";

/**
 * Validate order items stock availability
 */
export async function validateOrderStock(items: CartItem[]): Promise<{
  valid: boolean;
  outOfStockItems: Array<{ name: string; available: number; requested: number }>;
}> {
  const outOfStockItems: Array<{
    name: string;
    available: number;
    requested: number;
  }> = [];

  for (const item of items) {
    if (item.variantId) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
        select: { stock: true, name: true, product: { select: { name: true } } },
      });

      if (!variant || variant.stock < item.qty) {
        outOfStockItems.push({
          name: `${variant?.product.name} - ${variant?.name}`,
          available: variant?.stock || 0,
          requested: item.qty,
        });
      }
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true },
      });

      if (!product || product.stock < item.qty) {
        outOfStockItems.push({
          name: product?.name || "Unknown Product",
          available: product?.stock || 0,
          requested: item.qty,
        });
      }
    }
  }

  return {
    valid: outOfStockItems.length === 0,
    outOfStockItems,
  };
}

/**
 * Update product/variant stock after successful payment
 */
export async function decrementOrderItemsStock(
  orderItems: Array<{
    productId: string;
    variantId: string | null;
    qty: number;
  }>,
  tx: any // Prisma transaction client
): Promise<void> {
  // Group items by variant vs product
  const variantUpdates = orderItems
    .filter((item) => item.variantId)
    .map((item) => ({ id: item.variantId, qty: item.qty }));

  const productUpdates = orderItems
    .filter((item) => !item.variantId)
    .map((item) => ({ id: item.productId, qty: item.qty }));

  // Update variants in parallel
  const variantPromises = variantUpdates.map((item) =>
    tx.variant.update({
      where: { id: item.id as string },
      data: {
        stock: { decrement: item.qty },
      },
    })
  );

  // Update products in parallel
  const productPromises = productUpdates.map((item) =>
    tx.product.update({
      where: { id: item.id },
      data: {
        stock: { decrement: item.qty },
      },
    })
  );

  // Execute all updates in parallel
  await Promise.all([...variantPromises, ...productPromises]);
}

/**
 * Validate order pricing matches expected total
 */
export async function validateOrderPricing(
  items: CartItem[],
  expectedSubTotal: number,
  expectedTaxPrice: number
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Validate cart items pricing
  const priceValidation = await validateCartPrices(
    items,
    expectedSubTotal + expectedTaxPrice
  );

  if (!priceValidation.valid) {
    errors.push(
      `Price mismatch: Expected ${expectedSubTotal + expectedTaxPrice}, got ${
        priceValidation.actualTotal
      }`
    );
  }

  // Additional validations can be added here
  // e.g., validate shipping price, discount amounts, etc.

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create order items from cart items with pricing info
 */
export async function createOrderItemsData(items: CartItem[]): Promise<
  Array<{
    productId: string;
    variantId: string | null;
    name: string;
    image: string;
    qty: number;
    price: number;
    campaignId?: string;
  }>
> {
  const { itemsWithPrices } = await calculateCartItemsPrices(items);

  return itemsWithPrices.map((item) => ({
    productId: item.productId,
    variantId: item.variantId || null,
    name: item.name,
    image: item.image,
    qty: item.qty,
    price: item.finalPrice,
    campaignId: item.campaignId,
  }));
}

/**
 * Get order with full details
 */
export async function getOrderWithDetails(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

/**
 * Format order for response
 */
export function formatOrderResponse(order: any) {
  return {
    ...order,
    itemsPrice: Number(order.itemsPrice),
    totalPrice: Number(order.totalPrice),
    shippingPrice: Number(order.shippingPrice),
    taxPrice: Number(order.taxPrice),
    discountAmount: Number(order.discountAmount),
    orderItems: order.orderItems?.map((item: any) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}
