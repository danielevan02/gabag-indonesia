import prisma from "@/lib/prisma";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import { serializeType } from "@/lib/utils";
import z from "zod";

// Input schema for tRPC (without refinements for easier extending)
const voucherInputSchema = z.object({
  code: z.string().min(1, "Voucher code is required"),
  name: z.string().optional(),
  description: z.string().optional(),
  discountType: z.enum(["FIXED", "PERCENT"]),
  discountValue: z.number().min(0, "Discount value must be positive"),
  maxDiscount: z.number().optional(),
  applicationType: z.enum(["ALL_PRODUCTS", "CATEGORY", "SUBCATEGORY", "EVENT", "SPECIFIC_PRODUCTS", "SPECIFIC_VARIANTS"]),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  eventId: z.string().optional(),
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
  console.error(`${operation} error:`, error);
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

export const voucherRouter = createTRPCRouter({
  getAll: adminProcedure.query(async () => {
    const data = await prisma.voucher.findMany({
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        event: { select: { name: true } },
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
        event: { select: { name: true } },
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
          eventId,
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
              | "EVENT"
              | "SPECIFIC_PRODUCTS"
              | "SPECIFIC_VARIANTS",
            categoryId: categoryId || null,
            subCategoryId: subCategoryId || null,
            eventId: eventId || null,
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
          eventId,
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
          if (categoryId !== undefined || subCategoryId !== undefined || eventId !== undefined || productIds || variantIds) {
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
                | "EVENT"
                | "SPECIFIC_PRODUCTS"
                | "SPECIFIC_VARIANTS",
            }),
            ...(categoryId !== undefined && { categoryId: categoryId || null }),
            ...(subCategoryId !== undefined && { subCategoryId: subCategoryId || null }),
            ...(eventId !== undefined && { eventId: eventId || null }),
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
            eventId: true,
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
            eventId: product?.eventId,
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
        } else if (voucher.applicationType === "EVENT" && voucher.eventId) {
          eligibleAmount = enrichedItems
            .filter((item) => item.eventId === voucher.eventId)
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
        console.error("Validate voucher error:", error);
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
            eventId: true,
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
            eventId: product?.eventId,
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
          } else if (voucher.applicationType === "EVENT" && voucher.eventId) {
            eligibleAmount = enrichedItems
              .filter((item) => item.eventId === voucher.eventId)
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
        console.error("Get auto-apply voucher error:", error);
        return { found: false };
      }
    }),
});