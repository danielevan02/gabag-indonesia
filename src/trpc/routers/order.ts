import { z } from "zod";
import { baseProcedure, adminProcedure, protectedProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { CartItem, ShippingInfo, ItemDetail } from "@/types";
import { auth } from "../../auth";
import { createTransaction } from "@/lib/midtrans/transaction";
import { getCartHelper } from "./cart";

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
      } catch (error) {
        console.log(error)
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
        return handleMutationError(error, "Create Order");
      }
    }),

  // Make payment (Protected - logged in users only)
  makePayment: protectedProcedure
    .input(makePaymentSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, name, phone, subTotal, userId, orderId, cartItem, shippingPrice, taxPrice, discountAmount, voucherCode, voucherCodes } = input;

        if (!userId) throw new Error("You're not authenticated!");
        if (!email) throw new Error("You're not authenticated");
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
                    },
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

          // Calculate correct price based on campaign
          if (item.variantId) {
            const variant = product.variants.find((v) => v.id === item.variantId);
            if (!variant) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Variant for ${item.name} not found!`,
              });
            }

            // Check variant campaign
            const variantCampaignItem = product.campaignItems.find(
              (ci) => ci.variantId === item.variantId
            );

            if (variantCampaignItem) {
              const discount = variantCampaignItem.customDiscount || variantCampaignItem.campaign.defaultDiscount;
              const discountType = variantCampaignItem.customDiscountType || variantCampaignItem.campaign.discountType;

              if (discountType === "PERCENT") {
                validatedPrice = Number(variant.regularPrice) - (Number(variant.regularPrice) * (discount / 100));
              } else {
                validatedPrice = Number(variant.regularPrice) - discount;
              }
            } else {
              // Check whole product campaign
              const productCampaignItem = product.campaignItems.find((ci) => !ci.variantId);
              if (productCampaignItem) {
                const discount = productCampaignItem.customDiscount || productCampaignItem.campaign.defaultDiscount;
                const discountType = productCampaignItem.customDiscountType || productCampaignItem.campaign.discountType;

                if (discountType === "PERCENT") {
                  validatedPrice = Number(variant.regularPrice) - (Number(variant.regularPrice) * (discount / 100));
                } else {
                  validatedPrice = Number(variant.regularPrice) - discount;
                }
              } else {
                // Use variant's own discount
                validatedPrice = Number(variant.regularPrice) - (Number(variant.regularPrice) * ((variant.discount || 0) / 100));
              }
            }
          } else {
            // Product without variant
            const productCampaignItem = product.campaignItems.find((ci) => !ci.variantId);

            if (productCampaignItem) {
              const discount = productCampaignItem.customDiscount || productCampaignItem.campaign.defaultDiscount;
              const discountType = productCampaignItem.customDiscountType || productCampaignItem.campaign.discountType;

              if (discountType === "PERCENT") {
                validatedPrice = Number(product.regularPrice) - (Number(product.regularPrice) * (discount / 100));
              } else {
                validatedPrice = Number(product.regularPrice) - discount;
              }
            } else {
              // Use product's own discount
              validatedPrice = Number(product.regularPrice) - (Number(product.regularPrice) * ((product.discount || 0) / 100));
            }
          }

          // Check if price changed
          if (Math.abs(validatedPrice - item.price) > 0.01) {
            priceChanged = true;
          }

          validatedCartItems.push({
            ...item,
            price: validatedPrice,
          });
        }

        // If price changed due to expired campaign, throw error to inform user
        if (priceChanged) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Some campaign prices have changed. Please refresh your cart and try again.",
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
        return handleMutationError(error, "Make Payment");
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

        await prisma.$transaction(async (tx) => {
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

          const session = await auth();
          const userId = session?.user?.id;
          const cart = await getCartHelper(userId);

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

          // Create voucher redemption for all vouchers used
          if (activeVoucherCodes.length > 0) {
            for (const code of activeVoucherCodes) {
              const voucher = await tx.voucher.findUnique({
                where: { code: code },
              });

              if (voucher) {
                // Update voucher used count
                await tx.voucher.update({
                  where: { code: code },
                  data: {
                    usedCount: {
                      increment: 1,
                    },
                  },
                });

                // Create redemption record
                await tx.redemption.create({
                  data: {
                    voucherId: voucher.id,
                    userId: userId || null,
                    email: updatedOrder.user?.email || "",
                    orderId: orderId,
                  },
                });
              }
            }
          }

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
        });

        return handleMutationSuccess("Order Updated");
      } catch (error) {
        return handleMutationError(error, "Finalize Order");
      }
    }),

  // Update payment status
  updatePaymentStatus: baseProcedure
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

        return handleMutationSuccess("Payment Status Updated");
      } catch (error) {
        return handleMutationError(error, "Update Payment Status");
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
        return handleMutationError(error, "Update Order Shipment");
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
        return handleMutationError(error, "Delete Order");
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
        return handleMutationError(error, "Delete Orders");
      }
    }),
});