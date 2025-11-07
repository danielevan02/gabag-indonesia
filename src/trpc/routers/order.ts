import { z } from "zod";
import { baseProcedure, adminProcedure, protectedProcedure, systemProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { CartItem, ShippingInfo, ItemDetail } from "@/types";
import { auth } from "../../auth";
import { createTransaction } from "@/lib/midtrans/transaction";
import { getCartHelper } from "./cart";
import { invalidateCache } from "@/lib/cache";
import { roundPrice } from "@/services/pricing.service";

// Order schemas
const createOrderSchema = z.object({
  notes: z.string().optional(),
});

const makePaymentSchema = z.object({
  subTotal: z.number(),
  taxPrice: z.number(),
  shippingPrice: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  userId: z.string(),
  orderId: z.string(),
  cartItem: z.array(z.any()), // CartItem type
  discountAmount: z.number().optional(),
  voucherCode: z.string().optional(),
  voucherCodes: z.array(z.string()).optional(),
});

const finalizeOrderSchema = z.object({
  token: z.string().optional(),
  orderId: z.string(),
  itemsPrice: z.number().optional(),
  taxPrice: z.number().optional(),
  shippingPrice: z.number().optional(),
  totalPrice: z.number().optional(),
  courier: z.string().optional(),
  shippingInfo: z.any().optional(), // ShippingInfo type
  voucherCode: z.string().optional(),
  voucherCodes: z.array(z.string()).optional(),
  discountAmount: z.number().optional(),
});

const updatePaymentStatusSchema = z.object({
  orderId: z.string(),
  paymentStatus: z.string(),
});

const updateOrderShipmentSchema = z.object({
  id: z.string(),
  trackingOrder: z.string(),
  deliveredAt: z.date(),
});

const exportOrdersSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

const handleMutationSuccess = (message: string) => {
  return {
    success: true,
    message,
  };
};

export const orderRouter = createTRPCRouter({
  // Get all orders
  getAll: baseProcedure
    .input(z.object({ userId: z.string().optional() }))
    .query(async ({ input }) => {
      if (input.userId) {
        const data = await prisma.order.findMany({
          where: {
            userId: input.userId,
            paymentStatus: {
              not: null,
            },
          },
          include: {
            orderItems: {
              select: {
                id: true,
                productId: true,
                name: true,
                image: true,
                variantId: true,
                price: true,
                qty: true,
              },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return serializeType(data);
      } else {
        const data = await prisma.order.findMany({
          where: {
            paymentStatus: {
              not: null,
            },
          },
          include: {
            user: {
              select: {
                name: true,
              },
            },
            orderItems: {
              select: {
                id: true,
                productId: true,
                name: true,
                image: true,
                variantId: true,
                price: true,
                qty: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return serializeType(data);
      }
    }),

  // Get order by ID
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.order.findFirst({
        where: { id: input.id },
        include: { orderItems: true },
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      const convertedData = serializeType(data);

      return {
        ...convertedData,
        shippingInfo: convertedData?.shippingInfo as ShippingInfo,
      };
    }),

  // Get order items by order ID
  getOrderItems: baseProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      try {
        const items = await prisma.orderItem.findMany({
          where: {
            orderId: input.orderId,
          },
        });

        return serializeType([
          ...items.map((item) => ({
            ...item,
            weight: Number(item.weight),
            length: item.length ? Number(item.length) : null,
            width: item.width ? Number(item.width) : null,
            height: item.height ? Number(item.height) : null,
            price: Number(item.price),
          })),
        ]);
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get order items",
        });
      }
    }),

  // Create order (Protected - logged in users only)
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ input }) => {
      try {
        const session = await auth();
        if (!session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not authenticated",
          });
        }

        const userId = session.user?.id;
        const cart = await getCartHelper(userId);

        if (!userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not found",
          });
        }

        if (cart?.orderId) {
          return {
            success: true,
            message: "Order already exists",
            orderId: cart.orderId,
          };
        }

        if (!cart || cart.items.length === 0) {
          return {
            success: false,
            message: "There is no cart or product, please shop first",
          };
        }

        const newOrderId = await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              id: `Gbg_Order-${Date.now()}`,
              notes: input.notes,
              userId,
              itemsPrice: 0,
              totalPrice: 0,
              shippingPrice: 0,
              taxPrice: 0,
            },
          });

          await tx.cart.update({
            where: {
              id: cart.id,
            },
            data: {
              notes: input.notes,
              orderId: newOrder.id,
            },
          });
          return newOrder.id;
        });

        return {
          success: true,
          message: "Order created successfully",
          orderId: newOrderId,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to create order",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create order",
        });
      }
    }),

  // Make payment (Protected - logged in users only)
  makePayment: protectedProcedure
    .input(makePaymentSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, name, phone, subTotal, userId, orderId, cartItem, shippingPrice, taxPrice, discountAmount, voucherCode, voucherCodes } = input;

        if (!userId) throw new Error("You are not authenticated!");
        if (!email) throw new Error("Youa are not authenticated");
        if (!subTotal || subTotal <= 0) throw new Error("There is no product!");
        if (!phone) throw new Error("Please complete your identity (phone)");
        if (!name) throw new Error("Please complete your identity (name)");

        // Validate and recalculate prices based on active campaigns
        const now = new Date();
        const validatedCartItems: CartItem[] = [];
        let priceChanged = false;

        for (const item of cartItem) {
          // Fetch product with campaign info
          const product = await prisma.product.findFirst({
            where: { id: item.productId },
            include: {
              variants: {
                where: item.variantId ? { id: item.variantId } : undefined,
              },
              campaignItems: {
                where: {
                  campaign: {
                    startDate: { lte: now },
                    OR: [
                      { endDate: { gte: now } },
                      { endDate: null as any },
                    ],
                  },
                },
                include: {
                  campaign: {
                    select: {
                      defaultDiscount: true,
                      discountType: true,
                      priority: true,
                    },
                  },
                },
                orderBy: {
                  campaign: {
                    priority: 'desc', // Highest priority first
                  },
                },
              },
            },
          });

          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${item.name} not found!`,
            });
          }

          let validatedPrice = item.price;

          // Calculate correct price based on highest priority campaign
          if (item.variantId) {
            const variant = product.variants.find((v) => v.id === item.variantId);
            if (!variant) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Variant for ${item.name} not found!`,
              });
            }

            // Check variant campaign (already sorted by priority desc)
            // .find() returns first match = highest priority campaign
            const variantCampaignItem = product.campaignItems.find(
              (ci) => ci.variantId === item.variantId
            );

            if (variantCampaignItem) {
              const discount = variantCampaignItem.customDiscount || variantCampaignItem.campaign.defaultDiscount;
              const discountType = variantCampaignItem.customDiscountType || variantCampaignItem.campaign.discountType;

              // Only apply campaign discount if it's greater than 0
              if (discount > 0) {
                if (discountType === "PERCENT") {
                  validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * (discount / 100)));
                } else {
                  validatedPrice = roundPrice(Number(variant.regularPrice) - discount);
                }
              } else {
                // Campaign discount is 0, use variant's own discount
                validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * ((variant.discount || 0) / 100)));
              }
            } else {
              // Check whole product campaign (already sorted by priority desc)
              // .find() returns first match = highest priority
              const productCampaignItem = product.campaignItems.find((ci) => !ci.variantId);
              if (productCampaignItem) {
                const discount = productCampaignItem.customDiscount || productCampaignItem.campaign.defaultDiscount;
                const discountType = productCampaignItem.customDiscountType || productCampaignItem.campaign.discountType;

                // Only apply campaign discount if it's greater than 0
                if (discount > 0) {
                  if (discountType === "PERCENT") {
                    validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * (discount / 100)));
                  } else {
                    validatedPrice = roundPrice(Number(variant.regularPrice) - discount);
                  }
                } else {
                  // Campaign discount is 0, use variant's own discount
                  validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * ((variant.discount || 0) / 100)));
                }
              } else {
                // Use variant's own discount
                validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * ((variant.discount || 0) / 100)));
              }
            }
          } else {
            // Product without variant (already sorted by priority desc)
            // .find() returns first match = highest priority campaign
            const productCampaignItem = product.campaignItems.find((ci) => !ci.variantId);

            if (productCampaignItem) {
              const discount = productCampaignItem.customDiscount || productCampaignItem.campaign.defaultDiscount;
              const discountType = productCampaignItem.customDiscountType || productCampaignItem.campaign.discountType;

              // Only apply campaign discount if it's greater than 0
              if (discount > 0) {
                if (discountType === "PERCENT") {
                  validatedPrice = roundPrice(Number(product.regularPrice) - (Number(product.regularPrice) * (discount / 100)));
                } else {
                  validatedPrice = roundPrice(Number(product.regularPrice) - discount);
                }
              } else {
                // Campaign discount is 0, use product's own discount
                validatedPrice = roundPrice(Number(product.regularPrice) - (Number(product.regularPrice) * ((product.discount || 0) / 100)));
              }
            } else {
              // Use product's own discount
              validatedPrice = roundPrice(Number(product.regularPrice) - (Number(product.regularPrice) * ((product.discount || 0) / 100)));
            }
          }

          // Check if price changed (both prices already rounded)
          if (Math.abs(validatedPrice - item.price) > 1) {
            priceChanged = true;
          }

          validatedCartItems.push({
            ...item,
            price: validatedPrice,
          });
        }

        // If price changed due to expired/changed campaign, inform user
        if (priceChanged) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Harga produk telah berubah karena perubahan campaign. Silakan refresh halaman untuk melihat harga terbaru.",
          });
        }

        const item_details = validatedCartItems.map((item: CartItem) => ({
          id: item.variantId ? item.variantId : item.productId,
          name: item.name.slice(0, 40),
          price: item.price,
          quantity: item.qty,
        })) satisfies ItemDetail[];

        const firstName = name.split(" ")[0];
        const lastName = name.split(" ")[name.split(" ").length - 1];

        // Build item_details array
        const finalItemDetails: ItemDetail[] = [
          ...item_details,
          {
            id: Date.now().toString(),
            name: "Tax Price",
            price: taxPrice,
            quantity: 1,
          },
          {
            id: (Date.now() + 1).toString(),
            name: "Shipping Price",
            price: shippingPrice,
            quantity: 1,
          },
        ];

        // Add discount item for multiple vouchers or single voucher
        const activeVoucherCodes = voucherCodes && voucherCodes.length > 0 ? voucherCodes : (voucherCode ? [voucherCode] : []);
        if (discountAmount && discountAmount > 0 && activeVoucherCodes.length > 0) {
          finalItemDetails.push({
            id: (Date.now() + 2).toString(),
            name: `Voucher: ${activeVoucherCodes.join(", ")}`,
            price: -discountAmount, // Negative price for discount
            quantity: 1,
          });
        }

        const res = await createTransaction({
          payment_type: "gopay",
          transaction_details: {
            order_id: orderId,
            gross_amount: subTotal,
          },
          customer_details: {
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
          },
          item_details: finalItemDetails,
        });

        if (res && "token" in res) {
          return {
            success: true,
            message: "Payment Successful",
            token: res.token,
          };
        }

        return {
          success: false,
          message: "Payment Failed",
          token: "",
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to make payment",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to make payment",
        });
      }
    }),

  // Finalize order (Protected - logged in users only)
  finalize: protectedProcedure
    .input(finalizeOrderSchema)
    .mutation(async ({ input }) => {
      try {
        const { orderId, token, itemsPrice, shippingPrice, taxPrice, totalPrice, courier, shippingInfo, voucherCode, voucherCodes, discountAmount } = input;

        if (!token) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your payment is not valid!",
          });
        }

        // Use voucherCodes if provided, fallback to single voucherCode for backward compatibility
        const activeVoucherCodes = voucherCodes && voucherCodes.length > 0 ? voucherCodes : (voucherCode ? [voucherCode] : []);

        // FIX BUG #2, #3, #8: Re-validate and redeem vouchers atomically within transaction
        // SECURITY FIX: Use Serializable isolation to prevent voucher over-redemption
        await prisma.$transaction(async (tx) => {
          const session = await auth();
          const userId = session?.user?.id;
          const cart = await getCartHelper(userId);

          // FIX BUG #3: Re-validate all vouchers within transaction before redemption
          if (activeVoucherCodes.length > 0) {
            const now = new Date();

            for (const code of activeVoucherCodes) {
              // FIX CRITICAL BUG: Use raw query with FOR UPDATE to lock the voucher row
              // This prevents race conditions where multiple transactions read stale usedCount
              const vouchers = await tx.$queryRaw<Array<{
                id: string;
                code: string;
                isActive: boolean;
                startDate: Date;
                expires: Date;
                totalLimit: number | null;
                limitPerUser: number | null;
                usedCount: number;
              }>>`
                SELECT id, code, "isActive", "startDate", expires, "totalLimit", "limitPerUser", "usedCount"
                FROM "Voucher"
                WHERE code = ${code.toUpperCase()}
                FOR UPDATE
              `;

              const voucher = vouchers[0];

              if (!voucher) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" not found`,
                });
              }

              // Re-validate voucher status
              if (!voucher.isActive) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" is not active`,
                });
              }

              if (voucher.startDate > now) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" is not yet active`,
                });
              }

              if (voucher.expires < now) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" has expired`,
                });
              }

              // FIX BUG #2: Check total limit WITHIN transaction with LOCKED row data
              // This ensures we read the most up-to-date usedCount value
              if (voucher.totalLimit !== null && voucher.usedCount >= voucher.totalLimit) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" has reached its usage limit`,
                });
              }

              // Check user-specific limit within transaction
              if (voucher.limitPerUser !== null) {
                const userEmail = cart?.items ?
                  (await tx.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email :
                  "";

                if (userEmail) {
                  const userRedemptionCount = await tx.redemption.count({
                    where: {
                      voucherId: voucher.id,
                      email: userEmail,
                    },
                  });

                  if (userRedemptionCount >= voucher.limitPerUser) {
                    throw new TRPCError({
                      code: "BAD_REQUEST",
                      message: `You have reached the usage limit for voucher "${code}"`,
                    });
                  }
                }
              }
            }
          }

          // All vouchers validated, proceed with order update
          const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
              transactionToken: token,
              itemsPrice,
              shippingPrice,
              taxPrice,
              totalPrice,
              shippingInfo: shippingInfo,
              courier,
              paymentStatus: "pending",
              discountAmount: discountAmount ? BigInt(discountAmount) : 0,
              voucherCodes: activeVoucherCodes,
            },
            include: {
              orderItems: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          });

          if (!updatedOrder) throw new Error("There is no order found");

          if (updatedOrder?.orderItems.length === 0) {
            const orderItemsData = (cart?.items as CartItem[]).map((item) => ({
              orderId,
              productId: item.productId,
              name: item.name,
              qty: item.qty,
              price: item.price,
              variantId: item.variantId,
              slug: item.slug,
              image: item.image,
              weight: item.weight || 0,
              width: item.width || 0,
              length: item.length || 0,
              height: item.height || 0,
            }));

            await tx.orderItem.createMany({
              data: orderItemsData,
            });
          }

          // FIX BUG #8: Atomic voucher redemption with proper error handling
          // If any voucher fails, entire transaction rolls back
          if (activeVoucherCodes.length > 0) {
            const redemptionsToCreate = [];

            for (const code of activeVoucherCodes) {
              // FIX: Use FOR UPDATE lock again to prevent concurrent updates
              const vouchers = await tx.$queryRaw<Array<{
                id: string;
                code: string;
                totalLimit: number | null;
                usedCount: number;
              }>>`
                SELECT id, code, "totalLimit", "usedCount"
                FROM "Voucher"
                WHERE code = ${code.toUpperCase()}
                FOR UPDATE
              `;

              const voucher = vouchers[0];

              if (!voucher) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: `Failed to redeem voucher "${code}"`,
                });
              }

              // Double-check limit one more time right before increment
              if (voucher.totalLimit !== null && voucher.usedCount >= voucher.totalLimit) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" usage limit exceeded. Please try again.`,
                });
              }

              // Atomically increment usage count with strict limit check
              const updateResult = await tx.voucher.updateMany({
                where: {
                  code: code.toUpperCase(),
                  // CRITICAL: Ensure we only increment if current usedCount is valid
                  OR: [
                    { totalLimit: null },
                    { usedCount: { lt: voucher.totalLimit || 999999 } }
                  ]
                },
                data: {
                  usedCount: {
                    increment: 1,
                  },
                },
              });

              // If update affected 0 rows, it means limit was exceeded between validation and update
              if (updateResult.count === 0) {
                throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: `Voucher "${code}" usage limit exceeded. Please try again.`,
                });
              }

              // Prepare redemption record
              redemptionsToCreate.push({
                voucherId: voucher.id,
                userId: userId || null,
                email: updatedOrder.user?.email || "",
                orderId: orderId,
              });
            }

            // Create all redemption records
            for (const redemption of redemptionsToCreate) {
              await tx.redemption.create({
                data: redemption,
              });
            }
          }

          // Clear cart
          await tx.cart.update({
            where: { id: cart?.id },
            data: {
              items: [],
              orderId: null,
              itemsPrice: 0,
              taxPrice: 0,
              totalPrice: 0,
              shippingPrice: 0,
            },
          });
        }, {
          isolationLevel: 'Serializable', // Prevent voucher over-redemption on high concurrency
          maxWait: 5000, // 5 seconds max wait for transaction lock
          timeout: 30000, // 30 seconds timeout
        });

        return handleMutationSuccess("Order Updated");
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          // Handle PostgreSQL serialization error (concurrent voucher usage)
          if (error.message.includes("could not serialize access due to concurrent update") ||
              error.message.includes("40001")) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Voucher sedang digunakan oleh pengguna lain. Silakan coba lagi.",
            });
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to finalize order",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to finalize order",
        });
      }
    }),

  // Update payment status (System/Webhook only - protected at API route level)
  updatePaymentStatus: systemProcedure
    .input(updatePaymentStatusSchema)
    .mutation(async ({ input }) => {
      try {
        const { orderId, paymentStatus } = input;

        await prisma.$transaction(async (tx) => {
          const order = await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus,
              isPaid: ["capture", "settlement"].includes(paymentStatus),
              paidAt: ["capture", "settlement"].includes(paymentStatus) ? new Date() : undefined,
            },
            include: {
              orderItems: true,
            },
          });

          if (["capture", "settlement"].includes(paymentStatus)) {
            // Group items by variant vs product
            const variantUpdates = order.orderItems
              .filter((item) => item.variantId)
              .map((item) => ({ id: item.variantId, qty: item.qty }));

            const productUpdates = order.orderItems
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
        });

        // Invalidate dashboard cache when payment status changes
        invalidateCache.dashboard();

        return handleMutationSuccess("Payment Status Updated");
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to update payment status",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update payment status",
        });
      }
    }),

  // Update order shipment (Admin only)
  updateShipment: adminProcedure
    .input(updateOrderShipmentSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, trackingOrder, deliveredAt } = input;

        const deliveryDate = new Date(deliveredAt);
        await prisma.order.update({
          where: { id },
          data: {
            trackingOrder,
            deliveredAt: deliveryDate,
            isDelivered: true,
          },
        });

        return handleMutationSuccess("Order Shipment Updated");
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to update order shipment",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update order shipment",
        });
      }
    }),

  // Get orders for export by date range (Admin only)
  getForExport: adminProcedure
    .input(exportOrdersSchema)
    .query(async ({ input }) => {
      try {
        const { startDate, endDate } = input;

        // Parse dates - use simple string comparison in database query
        // This avoids timezone conversion issues
        const startDateTime = `${startDate}T00:00:00.000Z`;
        const endDateTime = `${endDate}T23:59:59.999Z`;

        const orders = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: new Date(startDateTime),
              lte: new Date(endDateTime),
            },
            paymentStatus: "settlement",
          },
          include: {
            user: {
              select: {
                name: true,
              },
            },
            orderItems: {
              select: {
                id: true,
                name: true,
                qty: true,
                price: true,
                productId: true,
                variantId: true,
                product: {
                  select: {
                    sku: true,
                  },
                },
                variant: {
                  select: {
                    sku: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return serializeType(orders);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to fetch orders for export",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch orders for export",
        });
      }
    }),

  // Delete order (Admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.order.delete({
          where: {
            id: input.id,
          },
        });

        return handleMutationSuccess("Order Deleted");
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to delete order",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete order",
        });
      }
    }),

  // Delete many orders (Admin only)
  deleteMany: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.order.deleteMany({
          where: {
            id: {
              in: input.ids,
            },
          },
        });

        return handleMutationSuccess("Orders Deleted");
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message || "Failed to delete orders",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete orders",
        });
      }
    }),
});