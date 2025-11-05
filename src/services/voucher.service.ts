/**
 * Voucher service - Handles voucher validation and redemption logic
 */

import prisma from "@/lib/prisma";

export interface VoucherValidationResult {
  valid: boolean;
  voucher?: any;
  error?: string;
  discount?: number;
}

/**
 * Validate voucher code for an order
 * Checks: existence, active status, date validity, usage limits, applicability
 */
export async function validateVoucherForOrder(
  voucherCode: string,
  userId: string,
  orderTotal: number,
  productIds: string[],
  variantIds: (string | null)[]
): Promise<VoucherValidationResult> {
  // Fetch voucher with FOR UPDATE lock to prevent race conditions
  const voucher = await prisma.$queryRaw<Array<any>>`
    SELECT id, code, "isActive", "startDate", expires, "totalLimit", "limitPerUser", "usedCount",
           type, value, "applicationType", "minPurchase", products, variants
    FROM "Voucher"
    WHERE code = ${voucherCode.toUpperCase()}
    FOR UPDATE
  `;

  if (!voucher || voucher.length === 0) {
    return {
      valid: false,
      error: "Voucher code not found",
    };
  }

  const voucherData = voucher[0];

  // Check if voucher is active
  if (!voucherData.isActive) {
    return {
      valid: false,
      error: "Voucher is not active",
    };
  }

  // Check date validity
  const now = new Date();
  if (new Date(voucherData.startDate) > now) {
    return {
      valid: false,
      error: "Voucher is not yet valid",
    };
  }

  if (voucherData.expires && new Date(voucherData.expires) < now) {
    return {
      valid: false,
      error: "Voucher has expired",
    };
  }

  // Check total usage limit
  if (
    voucherData.totalLimit &&
    voucherData.usedCount >= voucherData.totalLimit
  ) {
    return {
      valid: false,
      error: "Voucher usage limit reached",
    };
  }

  // Check per-user limit
  // Note: Usage tracking would need to be implemented based on your schema
  // For now, this is a placeholder for future implementation
  if (voucherData.limitPerUser) {
    // TODO: Implement proper per-user usage tracking
    // This would require adding a VoucherUsage table to track individual redemptions
  }

  // Check minimum purchase
  if (voucherData.minPurchase && orderTotal < voucherData.minPurchase) {
    return {
      valid: false,
      error: `Minimum purchase of ${voucherData.minPurchase} required`,
    };
  }

  // Check applicability (products/variants)
  if (voucherData.applicationType === "SPECIFIC_PRODUCTS") {
    const applicableProducts = voucherData.products || [];
    const hasApplicableProduct = productIds.some((id) =>
      applicableProducts.includes(id)
    );

    if (!hasApplicableProduct) {
      return {
        valid: false,
        error: "Voucher is not applicable to items in your cart",
      };
    }
  }

  if (voucherData.applicationType === "SPECIFIC_VARIANTS") {
    const applicableVariants = voucherData.variants || [];
    const hasApplicableVariant = variantIds.some(
      (id) => id && applicableVariants.includes(id)
    );

    if (!hasApplicableVariant) {
      return {
        valid: false,
        error: "Voucher is not applicable to items in your cart",
      };
    }
  }

  // Calculate discount
  const discount = calculateVoucherDiscount(
    voucherData.type,
    voucherData.value,
    orderTotal
  );

  return {
    valid: true,
    voucher: voucherData,
    discount,
  };
}

/**
 * Calculate discount amount based on voucher type and value
 */
export function calculateVoucherDiscount(
  type: string,
  value: number,
  orderTotal: number
): number {
  if (type === "PERCENTAGE") {
    return Math.round((orderTotal * value) / 100);
  } else if (type === "FIXED_AMOUNT") {
    return Math.min(value, orderTotal); // Don't exceed order total
  }

  return 0;
}

/**
 * Redeem voucher (increment usage count)
 */
export async function redeemVoucher(
  voucherId: string,
  userId: string,
  orderId: string,
  discountAmount: number,
  tx: any // Prisma transaction client
): Promise<void> {
  // Increment voucher usage count
  await tx.voucher.update({
    where: { id: voucherId },
    data: {
      usedCount: { increment: 1 },
    },
  });

  // TODO: Create usage record if VoucherUsage table exists in schema
  // await tx.voucherUsage.create({
  //   data: {
  //     voucherId,
  //     userId,
  //     orderId,
  //     discountAmount: BigInt(discountAmount),
  //     usedAt: new Date(),
  //   },
  // });
}

/**
 * Generate unique voucher code
 */
export function generateVoucherCode(prefix: string = ""): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`.substring(0, 20);
}

/**
 * Validate voucher batch creation parameters
 */
export function validateBatchParameters(params: {
  count: number;
  prefix?: string;
  type: string;
  value: number;
  startDate: Date;
  endDate?: Date;
  totalLimit?: number;
  limitPerUser?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (params.count < 1 || params.count > 10000) {
    errors.push("Count must be between 1 and 10,000");
  }

  if (params.type === "PERCENTAGE" && (params.value < 1 || params.value > 100)) {
    errors.push("Percentage value must be between 1 and 100");
  }

  if (params.type === "FIXED_AMOUNT" && params.value < 1) {
    errors.push("Fixed amount must be greater than 0");
  }

  if (params.endDate && params.endDate <= params.startDate) {
    errors.push("End date must be after start date");
  }

  if (params.totalLimit && params.totalLimit < 1) {
    errors.push("Total limit must be at least 1");
  }

  if (params.limitPerUser && params.limitPerUser < 1) {
    errors.push("Limit per user must be at least 1");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
