import prisma from "@/lib/prisma";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import { serializeType } from "@/lib/utils";
import { logger } from "@/lib/logger";
import crypto from 'crypto'
import z from "zod";

// Input schema for tRPC (without refinements for easier extending)
const voucherInputSchema = z.object({
  code: z.string().min(1, "Voucher code is required"),
  name: z.string().optional(),
  description: z.string().optional(),
  discountType: z.enum(["FIXED", "PERCENT"]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  maxDiscount: z.number().optional(),
  applicationType: z.enum(["ALL_PRODUCTS", "CATEGORY", "SUBCATEGORY", "SPECIFIC_PRODUCTS", "SPECIFIC_VARIANTS"]),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  variantIds: z.array(z.string()).optional(),
  maxShippingDiscount: z.number().optional(),
  startDate: z.coerce.date(),
  expiryDate: z.coerce.date(),
  minPurchase: z.number().optional(),
  totalLimit: z.number().optional(),
  limitPerUser: z.number().optional(),
  autoApply: z.boolean().default(false),
  canCombine: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

const handleMutationError = (error: unknown, operation: string) => {
  logger.error(`Voucher ${operation} failed`, error);
  return {
    success: false,
    message: `Failed to ${operation}`,
  };
};

const handleMutationSuccess = (message: string) => {
  return {
    success: true,
    message,
  };
};

// Helper function to generate unique voucher code
function generateVoucherCode(prefix: string, batchIndex: number): string {
  // Use crypto for secure random generation

  // Generate 6 bytes of random data (will give us 12 hex chars)
  const randomBytes = crypto.randomBytes(6);
  const randomStr = randomBytes.toString('hex').toUpperCase();

  // Include batch index to reduce collision probability
  const indexPart = batchIndex.toString(36).toUpperCase().padStart(3, '0');

  return `${prefix}-${indexPart}${randomStr.slice(0, 8)}`;
}

export const voucherRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    const data = await prisma.voucher.findMany({
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        products: { select: { id: true, name: true } },
        variants: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeType(data);
  }),

  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const data = await prisma.voucher.findUnique({
      where: { id: input.id },
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        products: { select: { id: true, name: true } },
        variants: { select: { id: true, name: true } },
      },
    });

    return serializeType(data);
  }),

  create: adminProcedure.input(voucherInputSchema).mutation(async ({ input }) => {
      try {
        const {
          code,
          name,
          description,
          discountType,
          discountValue,
          maxDiscount,
          applicationType,
          categoryId,
          subCategoryId,
          productIds,
          variantIds,
          maxShippingDiscount,
          startDate,
          expiryDate,
          minPurchase,
          totalLimit,
          limitPerUser,
          autoApply,
          canCombine,
          isActive,
        } = input;

        await prisma.voucher.create({
          data: {
            code: code.toUpperCase(),
            name,
            description: description || null,
            type: discountType as "FIXED" | "PERCENT",
            value: discountValue,
            maxDiscount: maxDiscount ? BigInt(maxDiscount) : null,
            applicationType: applicationType as
              | "ALL_PRODUCTS"
              | "CATEGORY"
              | "SUBCATEGORY"
              | "SPECIFIC_PRODUCTS"
              | "SPECIFIC_VARIANTS",
            categoryId: categoryId || null,
            subCategoryId: subCategoryId || null,
            maxShippingDiscount: maxShippingDiscount ? BigInt(maxShippingDiscount) : null,
            startDate,
            expires: expiryDate,
            minPurchase: minPurchase ? BigInt(minPurchase) : null,
            totalLimit: totalLimit || null,
            limitPerUser: limitPerUser || null,
            autoApply,
            canCombine,
            isActive,
            products:
              productIds && productIds.length > 0
                ? {
                    connect: productIds.map((id: string) => ({ id })),
                  }
                : undefined,
            variants:
              variantIds && variantIds.length > 0
                ? {
                    connect: variantIds.map((id: string) => ({ id })),
                  }
                : undefined,
          },
        });

        return handleMutationSuccess("Voucher created successfully");
      } catch (error) {
        return handleMutationError(error, "create voucher");
      }
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: voucherInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if voucher exists and get usedCount
        const existingVoucher = await prisma.voucher.findUnique({
          where: { id: input.id },
          select: { usedCount: true, code: true, totalLimit: true },
        });

        if (!existingVoucher) {
          return {
            success: false,
            message: "Voucher not found",
          };
        }

        const hasBeenUsed = existingVoucher.usedCount > 0;

        const {
          code,
          discountType,
          discountValue,
          maxDiscount,
          applicationType,
          categoryId,
          subCategoryId,
          productIds,
          variantIds,
          maxShippingDiscount,
          startDate,
          expiryDate,
          minPurchase,
          totalLimit,
          limitPerUser,
          autoApply,
          canCombine,
          isActive,
          ...rest
        } = input.data;

        // Validate restricted fields for used vouchers
        if (hasBeenUsed) {
          if (code) {
            return {
              success: false,
              message: "Cannot change voucher code after it has been used",
            };
          }
          if (discountType) {
            return {
              success: false,
              message: "Cannot change discount type after voucher has been used",
            };
          }
          if (applicationType) {
            return {
              success: false,
              message: "Cannot change application type after voucher has been used",
            };
          }
          if (categoryId !== undefined || subCategoryId !== undefined || productIds || variantIds) {
            return {
              success: false,
              message: "Cannot change voucher scope (category/product/variant) after it has been used",
            };
          }
          if (totalLimit !== undefined && totalLimit < existingVoucher.usedCount) {
            return {
              success: false,
              message: `Cannot set total limit below used count (${existingVoucher.usedCount})`,
            };
          }
        }

        // If productIds provided, first disconnect all, then connect new ones
        const productUpdate =
          productIds && productIds.length > 0
            ? {
                set: [], // Clear existing connections
                connect: productIds.map((id: string) => ({ id })),
              }
            : undefined;

        // If variantIds provided, first disconnect all, then connect new ones
        const variantUpdate =
          variantIds && variantIds.length > 0
            ? {
                set: [], // Clear existing connections
                connect: variantIds.map((id: string) => ({ id })),
              }
            : undefined;

        await prisma.voucher.update({
          where: { id: input.id },
          data: {
            ...rest,
            ...(discountType && { type: discountType as "FIXED" | "PERCENT" }),
            ...(discountValue !== undefined && { value: discountValue }),
            ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? BigInt(maxDiscount) : null }),
            ...(applicationType && {
              applicationType: applicationType as
                | "ALL_PRODUCTS"
                | "CATEGORY"
                | "SUBCATEGORY"
                | "SPECIFIC_PRODUCTS"
                | "SPECIFIC_VARIANTS",
            }),
            ...(categoryId !== undefined && { categoryId: categoryId || null }),
            ...(subCategoryId !== undefined && { subCategoryId: subCategoryId || null }),
            ...(maxShippingDiscount !== undefined && {
              maxShippingDiscount: maxShippingDiscount ? BigInt(maxShippingDiscount) : null,
            }),
            ...(startDate && { startDate }),
            ...(expiryDate && { expires: expiryDate }),
            ...(minPurchase !== undefined && { minPurchase: minPurchase ? BigInt(minPurchase) : null }),
            ...(totalLimit !== undefined && { totalLimit: totalLimit || null }),
            ...(limitPerUser !== undefined && { limitPerUser: limitPerUser || null }),
            ...(autoApply !== undefined && { autoApply }),
            ...(canCombine !== undefined && { canCombine }),
            ...(isActive !== undefined && { isActive }),
            ...(productUpdate && { products: productUpdate }),
            ...(variantUpdate && { variants: variantUpdate }),
          },
        });

        return handleMutationSuccess("Voucher updated successfully");
      } catch (error) {
        return handleMutationError(error, "update voucher");
      }
    }),

  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      // Check if voucher has been used
      const voucher = await prisma.voucher.findUnique({
        where: { id: input.id },
        select: { usedCount: true, code: true },
      });

      if (!voucher) {
        return {
          success: false,
          message: "Voucher not found",
        };
      }

      if (voucher.usedCount > 0) {
        return {
          success: false,
          message: `Cannot delete voucher "${voucher.code}". It has been used ${voucher.usedCount} time(s). Please deactivate instead.`,
        };
      }

      await prisma.voucher.delete({
        where: {
          id: input.id,
        },
      });
      return handleMutationSuccess("Voucher Deleted");
    } catch (error) {
      return handleMutationError(error, "Delete Voucher");
    }
  }),

  deleteMany: adminProcedure.input(z.object({ ids: z.array(z.string()) })).mutation(async ({ input }) => {
    try {
      // Check if any vouchers have been used
      const vouchers = await prisma.voucher.findMany({
        where: {
          id: { in: input.ids },
        },
        select: { id: true, usedCount: true, code: true },
      });

      const usedVouchers = vouchers.filter((v) => v.usedCount > 0);

      if (usedVouchers.length > 0) {
        const codes = usedVouchers.map((v) => v.code).join(", ");
        return {
          success: false,
          message: `Cannot delete vouchers: ${codes}. They have been used. Please deactivate instead.`,
        };
      }

      // Only delete vouchers that haven't been used
      const unusedIds = vouchers.filter((v) => v.usedCount === 0).map((v) => v.id);

      if (unusedIds.length === 0) {
        return {
          success: false,
          message: "No vouchers can be deleted. All selected vouchers have been used.",
        };
      }

      await prisma.voucher.deleteMany({
        where: {
          id: {
            in: unusedIds,
          },
        },
      });

      return handleMutationSuccess(
        `${unusedIds.length} voucher(s) deleted. ${usedVouchers.length} used voucher(s) were skipped.`
      );
    } catch (error) {
      return handleMutationError(error, "Delete Vouchers");
    }
  }),

  // Validate voucher for order
  validate: baseProcedure
    .input(
      z.object({
        code: z.string(),
        userId: z.string().optional(),
        email: z.string().email(),
        subtotal: z.number(),
        shippingFee: z.number(),
        orderItems: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            categoryId: z.string().optional(),
            subCategoryId: z.string().optional(),
            eventId: z.string().optional(),
            price: z.number(),
            qty: z.number(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const voucher = await prisma.voucher.findUnique({
          where: { code: input.code.toUpperCase() },
          include: {
            products: { select: { id: true } },
            variants: { select: { id: true } },
          },
        });

        if (!voucher) {
          return { valid: false, message: "Voucher not found" };
        }

        // Fetch product details untuk mendapatkan categoryId, subCategoryId, eventId
        const productIds = input.orderItems.map((item) => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            subCategoryId: true,
            subCategory: {
              select: {
                categoryId: true,
              },
            },
          },
        });

        // Enrich order items dengan product info
        const enrichedItems = input.orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            ...item,
            categoryId: product?.subCategory?.categoryId,
            subCategoryId: product?.subCategoryId,
          };
        });

        if (!voucher.isActive) {
          return { valid: false, message: "Voucher is not active" };
        }

        const now = new Date();

        if (voucher.startDate > now) {
          return { valid: false, message: "Voucher is not yet active" };
        }

        if (voucher.expires < now) {
          return { valid: false, message: "Voucher has expired" };
        }

        if (voucher.minPurchase && BigInt(input.subtotal) < voucher.minPurchase) {
          return {
            valid: false,
            message: `Minimum purchase of Rp ${Number(voucher.minPurchase).toLocaleString()} required`,
          };
        }

        if (voucher.totalLimit && voucher.usedCount >= voucher.totalLimit) {
          return { valid: false, message: "Voucher limit reached" };
        }

        // Check user redemption limit
        if (voucher.limitPerUser && input.email) {
          const userRedemptions = await prisma.redemption.count({
            where: {
              voucherId: voucher.id,
              email: input.email,
            },
          });

          if (userRedemptions >= voucher.limitPerUser) {
            return { valid: false, message: "You have reached the usage limit for this voucher" };
          }
        }

        // Calculate eligible items based on voucher scope
        let eligibleAmount = 0;
        let eligibleShipping = 0;

        if (voucher.applicationType === "ALL_PRODUCTS") {
          eligibleAmount = input.subtotal;
        } else if (voucher.applicationType === "CATEGORY" && voucher.categoryId) {
          eligibleAmount = enrichedItems
            .filter((item) => item.categoryId === voucher.categoryId)
            .reduce((sum, item) => sum + item.price * item.qty, 0);
        } else if (voucher.applicationType === "SUBCATEGORY" && voucher.subCategoryId) {
          eligibleAmount = enrichedItems
            .filter((item) => item.subCategoryId === voucher.subCategoryId)
            .reduce((sum, item) => sum + item.price * item.qty, 0);
        } else if (voucher.applicationType === "SPECIFIC_PRODUCTS") {
          const productIds = voucher.products.map((p) => p.id);
          eligibleAmount = enrichedItems
            .filter((item) => productIds.includes(item.productId))
            .reduce((sum, item) => sum + item.price * item.qty, 0);
        } else if (voucher.applicationType === "SPECIFIC_VARIANTS") {
          const variantIds = voucher.variants.map((v) => v.id);
          eligibleAmount = enrichedItems
            .filter((item) => item.variantId && variantIds.includes(item.variantId))
            .reduce((sum, item) => sum + item.price * item.qty, 0);
        }

        if (eligibleAmount === 0) {
          return { valid: false, message: "No eligible items in cart for this voucher" };
        }

        // Calculate discount
        let discount = 0;
        if (voucher.type === "FIXED") {
          discount = voucher.value;
        } else if (voucher.type === "PERCENT") {
          discount = (eligibleAmount * voucher.value) / 100;
          if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
            discount = Number(voucher.maxDiscount);
          }
        }

        // Calculate shipping discount
        if (voucher.maxShippingDiscount && input.shippingFee > 0) {
          const maxShipping = Number(voucher.maxShippingDiscount);
          eligibleShipping = Math.min(input.shippingFee, maxShipping);
        }

        const totalDiscount = discount + eligibleShipping;

        return {
          valid: true,
          voucher: serializeType(voucher),
          discount: Math.round(discount),
          shippingDiscount: Math.round(eligibleShipping),
          totalDiscount: Math.round(totalDiscount),
          canCombine: voucher.canCombine,
        };
      } catch (error) {
        logger.error("Voucher validation failed", error);
        return { valid: false, message: "Failed to validate voucher" };
      }
    }),

  // Get auto-apply vouchers
  getAutoApply: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        userId: z.string().optional(),
        subtotal: z.number(),
        shippingFee: z.number(),
        orderItems: z.array(
          z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            categoryId: z.string().optional(),
            subCategoryId: z.string().optional(),
            eventId: z.string().optional(),
            price: z.number(),
            qty: z.number(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      try {
        const now = new Date();

        // Fetch all active auto-apply vouchers
        const vouchers = await prisma.voucher.findMany({
          where: {
            isActive: true,
            autoApply: true,
            startDate: { lte: now },
            expires: { gte: now },
          },
          include: {
            products: { select: { id: true } },
            variants: { select: { id: true } },
          },
          orderBy: {
            value: "desc", // Prioritize higher value vouchers
          },
        });

        // Fetch product details
        const productIds = input.orderItems.map((item) => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: {
            id: true,
            subCategoryId: true,
            subCategory: {
              select: {
                categoryId: true,
              },
            },
          },
        });

        // Enrich order items
        const enrichedItems = input.orderItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            ...item,
            categoryId: product?.subCategory?.categoryId,
            subCategoryId: product?.subCategoryId,
          };
        });

        // Find the best applicable voucher
        for (const voucher of vouchers) {
          // Check min purchase
          if (voucher.minPurchase && BigInt(input.subtotal) < voucher.minPurchase) {
            continue;
          }

          // Check total limit
          if (voucher.totalLimit && voucher.usedCount >= voucher.totalLimit) {
            continue;
          }

          // Check user redemption limit
          if (voucher.limitPerUser && input.email) {
            const userRedemptions = await prisma.redemption.count({
              where: {
                voucherId: voucher.id,
                email: input.email,
              },
            });

            if (userRedemptions >= voucher.limitPerUser) {
              continue;
            }
          }

          // Check if voucher applies to cart items
          let eligibleAmount = 0;

          if (voucher.applicationType === "ALL_PRODUCTS") {
            eligibleAmount = input.subtotal;
          } else if (voucher.applicationType === "CATEGORY" && voucher.categoryId) {
            eligibleAmount = enrichedItems
              .filter((item) => item.categoryId === voucher.categoryId)
              .reduce((sum, item) => sum + item.price * item.qty, 0);
          } else if (voucher.applicationType === "SUBCATEGORY" && voucher.subCategoryId) {
            eligibleAmount = enrichedItems
              .filter((item) => item.subCategoryId === voucher.subCategoryId)
              .reduce((sum, item) => sum + item.price * item.qty, 0);
          } else if (voucher.applicationType === "SPECIFIC_PRODUCTS") {
            const productIds = voucher.products.map((p) => p.id);
            eligibleAmount = enrichedItems
              .filter((item) => productIds.includes(item.productId))
              .reduce((sum, item) => sum + item.price * item.qty, 0);
          } else if (voucher.applicationType === "SPECIFIC_VARIANTS") {
            const variantIds = voucher.variants.map((v) => v.id);
            eligibleAmount = enrichedItems
              .filter((item) => item.variantId && variantIds.includes(item.variantId))
              .reduce((sum, item) => sum + item.price * item.qty, 0);
          }

          if (eligibleAmount === 0) {
            continue;
          }

          // Calculate discount
          let discount = 0;
          let eligibleShipping = 0;

          if (voucher.type === "FIXED") {
            discount = voucher.value;
          } else if (voucher.type === "PERCENT") {
            discount = (eligibleAmount * voucher.value) / 100;
            if (voucher.maxDiscount && discount > Number(voucher.maxDiscount)) {
              discount = Number(voucher.maxDiscount);
            }
          }

          // Calculate shipping discount
          if (voucher.maxShippingDiscount && input.shippingFee > 0) {
            const maxShipping = Number(voucher.maxShippingDiscount);
            eligibleShipping = Math.min(input.shippingFee, maxShipping);
          }

          const totalDiscount = discount + eligibleShipping;

          // Return the first valid voucher (highest value)
          return {
            found: true,
            voucher: {
              code: voucher.code,
              name: voucher.name,
              discount: Math.round(discount),
              shippingDiscount: Math.round(eligibleShipping),
              totalDiscount: Math.round(totalDiscount),
              canCombine: voucher.canCombine,
            },
          };
        }

        return { found: false };
      } catch (error) {
        logger.error("Auto-apply voucher retrieval failed", error);
        return { found: false };
      }
    }),

  // ============================================
  // BATCH VOUCHER ENDPOINTS
  // ============================================

  createBatch: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Batch name is required"),
        description: z.string().optional(),
        prefix: z
          .string()
          .min(3, "Prefix must be at least 3 characters")
          .max(20, "Prefix must not exceed 20 characters")
          .regex(/^[A-Z0-9]+$/, "Prefix must only contain uppercase letters and numbers"),
        totalCodes: z.number().min(1).max(10000, "Maximum 10,000 codes per batch"),
        discountType: z.enum(["FIXED", "PERCENT"]),
        discountValue: z.number().min(0),
        maxDiscount: z.number().optional(),
        applicationType: z.enum(["ALL_PRODUCTS", "CATEGORY", "SUBCATEGORY", "SPECIFIC_PRODUCTS", "SPECIFIC_VARIANTS"]),
        categoryId: z.string().optional(),
        subCategoryId: z.string().optional(),
        productIds: z.array(z.string()).optional(),
        variantIds: z.array(z.string()).optional(),
        maxShippingDiscount: z.number().optional(),
        startDate: z.coerce.date(),
        expiryDate: z.coerce.date(),
        minPurchase: z.number().optional(),
        canCombine: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const {
          name,
          description,
          prefix,
          totalCodes,
          discountType,
          discountValue,
          maxDiscount,
          applicationType,
          categoryId,
          subCategoryId,
          productIds,
          variantIds,
          maxShippingDiscount,
          startDate,
          expiryDate,
          minPurchase,
          canCombine,
        } = input;

        // Validate prefix uniqueness (check for existing batches with same prefix)
        const existingBatch = await prisma.voucherBatch.findFirst({
          where: { prefix: prefix.toUpperCase() },
        });

        if (existingBatch) {
          return {
            success: false,
            message: `Prefix "${prefix}" is already used by batch: ${existingBatch.name}. Please use a different prefix.`,
          };
        }

        // FIX BUG #1, #4, #5: Wrap everything in a transaction with proper isolation
        // SECURITY FIX: Use Serializable isolation to prevent race conditions
        const result = await prisma.$transaction(async (tx) => {
          // Generate all voucher codes first (in memory)
          const generatedCodes: string[] = [];
          const vouchersToCreate = [];
          const seenCodes = new Set<string>();

          for (let i = 0; i < totalCodes; i++) {
            let code = generateVoucherCode(prefix.toUpperCase(), i);
            let attempts = 0;

            // Ensure uniqueness within this batch
            while (seenCodes.has(code)) {
              code = generateVoucherCode(prefix.toUpperCase(), i + attempts * 1000);
              attempts++;
              if (attempts > 100) {
                throw new Error(`Failed to generate unique voucher code at index ${i}`);
              }
            }

            seenCodes.add(code);
            generatedCodes.push(code);

            vouchersToCreate.push({
              code,
              name: `${name} - ${i + 1}`,
              description: description || null,
              type: discountType as "FIXED" | "PERCENT",
              value: discountValue,
              maxDiscount: maxDiscount ? BigInt(maxDiscount) : null,
              applicationType: applicationType as any,
              categoryId: categoryId || null,
              subCategoryId: subCategoryId || null,
              maxShippingDiscount: maxShippingDiscount ? BigInt(maxShippingDiscount) : null,
              startDate,
              expires: expiryDate,
              minPurchase: minPurchase ? BigInt(minPurchase) : null,
              totalLimit: 1, // Each batch voucher can only be used once
              limitPerUser: 1, // Each user can only use it once
              canCombine,
              isActive: true,
              autoApply: false,
            });
          }

          // Check for existing voucher codes in database (within transaction)
          const existingVouchers = await tx.voucher.findMany({
            where: { code: { in: generatedCodes } },
            select: { code: true },
          });

          if (existingVouchers.length > 0) {
            const existingCodes = existingVouchers.map(v => v.code).join(", ");
            throw new Error(
              `Some voucher codes already exist: ${existingCodes}. Please try again with a different prefix.`
            );
          }

          // Create the batch
          const batch = await tx.voucherBatch.create({
            data: {
              name,
              description: description || null,
              prefix: prefix.toUpperCase(),
              totalCodes,
              templateValue: discountValue,
              templateType: discountType as "FIXED" | "PERCENT",
              templateApplicationType: applicationType as any,
              templateMinPurchase: minPurchase ? BigInt(minPurchase) : null,
              templateMaxDiscount: maxDiscount ? BigInt(maxDiscount) : null,
              templateMaxShippingDiscount: maxShippingDiscount ? BigInt(maxShippingDiscount) : null,
              templateStartDate: startDate,
              templateExpires: expiryDate,
              templateCanCombine: canCombine,
              categoryId: categoryId || null,
              subCategoryId: subCategoryId || null,
              productIds: productIds || [],
              variantIds: variantIds || [],
              generatedCodes,
              generatedCount: totalCodes,
            },
          });

          // Bulk create all vouchers at once
          await tx.voucher.createMany({
            data: vouchersToCreate,
            skipDuplicates: true, // Extra safety
          });

          // FIX BUG #5: Use raw SQL for batch many-to-many relations instead of N+1 queries
          if (productIds && productIds.length > 0) {
            // Get voucher IDs for the generated codes
            const voucherIds = await tx.voucher.findMany({
              where: { code: { in: generatedCodes } },
              select: { id: true },
            });

            const voucherIdArray = voucherIds.map(v => v.id);

            // SECURITY FIX: Use Prisma's createMany instead of raw SQL to prevent SQL injection
            // Build all relations in memory
            const relations = [];
            for (const voucherId of voucherIdArray) {
              for (const productId of productIds) {
                relations.push({
                  A: voucherId,
                  B: productId,
                });
              }
            }

            // Batch insert in chunks to avoid query size limits (1000 relations per chunk)
            const chunkSize = 1000;
            for (let i = 0; i < relations.length; i += chunkSize) {
              const chunk = relations.slice(i, i + chunkSize);

              // Use Prisma's executeRaw with proper parameterization
              await tx.$executeRaw`
                INSERT INTO "_ProductToVoucher" ("A", "B")
                SELECT * FROM jsonb_to_recordset(${JSON.stringify(chunk)}::jsonb)
                AS x("A" uuid, "B" uuid)
                ON CONFLICT DO NOTHING
              `;
            }
          }

          if (variantIds && variantIds.length > 0) {
            // Get voucher IDs for the generated codes
            const voucherIds = await tx.voucher.findMany({
              where: { code: { in: generatedCodes } },
              select: { id: true },
            });

            const voucherIdArray = voucherIds.map(v => v.id);

            // SECURITY FIX: Use Prisma's createMany instead of raw SQL to prevent SQL injection
            // Build all relations in memory
            const relations = [];
            for (const voucherId of voucherIdArray) {
              for (const variantId of variantIds) {
                relations.push({
                  A: voucherId,
                  B: variantId,
                });
              }
            }

            // Batch insert in chunks to avoid query size limits (1000 relations per chunk)
            const chunkSize = 1000;
            for (let i = 0; i < relations.length; i += chunkSize) {
              const chunk = relations.slice(i, i + chunkSize);

              // Use Prisma's executeRaw with proper parameterization
              await tx.$executeRaw`
                INSERT INTO "_VariantToVoucher" ("A", "B")
                SELECT * FROM jsonb_to_recordset(${JSON.stringify(chunk)}::jsonb)
                AS x("A" uuid, "B" uuid)
                ON CONFLICT DO NOTHING
              `;
            }
          }

          return { batchId: batch.id, totalCodes };
        }, {
          isolationLevel: 'Serializable', // Prevent race conditions on high concurrency
          maxWait: 10000, // 10 seconds max wait for transaction lock
          timeout: 60000, // 60 seconds timeout for large batches
        });

        return handleMutationSuccess(
          `Batch created successfully! ${result.totalCodes} voucher codes generated.`
        );
      } catch (error) {
        logger.error("Voucher batch creation failed", error);
        return handleMutationError(error, "create voucher batch");
      }
    }),

  getAllBatches: adminProcedure.query(async () => {
    const batches = await prisma.voucherBatch.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Optimize: Get all voucher usage stats in a single query
    const allCodes = batches.flatMap((batch) => batch.generatedCodes);
    const usedVouchers = await prisma.voucher.findMany({
      where: {
        code: { in: allCodes },
        usedCount: { gt: 0 },
      },
      select: {
        code: true,
      },
    });

    // Create a Set for O(1) lookups
    const usedCodesSet = new Set(usedVouchers.map((v) => v.code));

    // Calculate stats for each batch
    const batchesWithStats = batches.map((batch) => {
      const usedCount = batch.generatedCodes.filter((code) =>
        usedCodesSet.has(code)
      ).length;

      return {
        ...batch,
        usedCount,
        availableCount: batch.generatedCount - usedCount,
      };
    });

    return serializeType(batchesWithStats);
  }),

  getBatchDetail: adminProcedure
    .input(
      z.object({
        id: z.string(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(10).max(100).default(50),
        filter: z.enum(["all", "used", "available"]).default("all"),
      })
    )
    .query(async ({ input }) => {
      const { id, page, pageSize, filter } = input;

      const batch = await prisma.voucherBatch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error("Batch not found");
      }

      // FIX BUG #12: Add pagination to prevent loading too many vouchers at once
      const skip = (page - 1) * pageSize;

      // Build where clause based on filter
      const whereClause: any = {
        code: { in: batch.generatedCodes },
      };

      if (filter === "used") {
        whereClause.usedCount = { gt: 0 };
      } else if (filter === "available") {
        whereClause.usedCount = 0;
      }

      // Get total count for pagination
      const totalCount = await prisma.voucher.count({
        where: whereClause,
      });

      // Get paginated vouchers
      const vouchers = await prisma.voucher.findMany({
        where: whereClause,
        include: {
          redemptions: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize,
      });

      return serializeType({
        batch,
        vouchers,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      });
    }),

  deleteBatch: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // SECURITY FIX: Wrap delete operations in transaction to prevent orphaned data
        await prisma.$transaction(async (tx) => {
          const batch = await tx.voucherBatch.findUnique({
            where: { id: input.id },
          });

          if (!batch) {
            throw new Error("Batch not found");
          }

          // Check if any vouchers have been used
          const usedVouchers = await tx.voucher.findMany({
            where: {
              code: { in: batch.generatedCodes },
              usedCount: { gt: 0 },
            },
            select: { code: true },
          });

          if (usedVouchers.length > 0) {
            throw new Error(`Cannot delete batch. ${usedVouchers.length} voucher(s) have been used.`);
          }

          // Delete all vouchers in the batch first (respect foreign key constraints)
          await tx.voucher.deleteMany({
            where: {
              code: { in: batch.generatedCodes },
            },
          });

          // Then delete the batch
          await tx.voucherBatch.delete({
            where: { id: input.id },
          });
        }, {
          isolationLevel: 'Serializable',
          maxWait: 5000,
          timeout: 30000,
        });

        return handleMutationSuccess("Batch deleted successfully");
      } catch (error) {
        // Check if it's a validation error (used vouchers)
        if (error instanceof Error && error.message.includes("Cannot delete batch")) {
          return {
            success: false,
            message: error.message,
          };
        }
        if (error instanceof Error && error.message === "Batch not found") {
          return {
            success: false,
            message: "Batch not found",
          };
        }
        return handleMutationError(error, "delete batch");
      }
    }),
});