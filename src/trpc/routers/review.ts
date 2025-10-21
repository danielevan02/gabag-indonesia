import { z } from "zod";
import { baseProcedure, protectedProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { TRPCError } from "@trpc/server";

// Review schemas
const createReviewSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

const getProductReviewsSchema = z.object({
  productId: z.string(),
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

const getUserOrdersForReviewSchema = z.object({
  userId: z.string(),
});

export const reviewRouter = createTRPCRouter({
  // Get reviews for a product
  getByProduct: baseProcedure
    .input(getProductReviewsSchema)
    .query(async ({ input }) => {
      const { productId, limit, offset, search, rating } = input;

      // Build where clause with filters
      const whereClause: any = { productId };

      if (search) {
        whereClause.comment = {
          contains: search,
          mode: 'insensitive',
        };
      }

      if (rating) {
        whereClause.rating = rating;
      }

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where: whereClause,
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.review.count({
          where: whereClause,
        }),
      ]);

      // Calculate average rating
      const avgRating = await prisma.review.aggregate({
        where: { productId },
        _avg: {
          rating: true,
        },
      });

      // Calculate rating distribution
      const allReviews = await prisma.review.findMany({
        where: { productId },
        select: {
          rating: true,
        },
      });

      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      allReviews.forEach((review) => {
        ratingDistribution[review.rating]++;
      });

      return {
        reviews,
        total,
        averageRating: avgRating._avg.rating || 0,
        ratingDistribution,
      };
    }),

  // Get orders that can be reviewed by user
  getOrdersForReview: protectedProcedure
    .input(getUserOrdersForReviewSchema)
    .query(async ({ input, ctx }) => {
      const { userId } = input;

      // Verify user is requesting their own orders
      if (ctx.session?.user?.id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own orders",
        });
      }

      // Get delivered orders with products that haven't been reviewed yet
      const orders = await prisma.order.findMany({
        where: {
          userId,
          isDelivered: true,
          paymentStatus: {
            in: ["capture", "settlement"],
          },
        },
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
          reviews: {
            select: {
              productId: true,
            },
          },
        },
        orderBy: {
          deliveredAt: "desc",
        },
      });

      // Transform to include reviewable status for each product
      const ordersWithReviewStatus = orders.map((order) => {
        const reviewedProductIds = new Set(
          order.reviews.map((r) => r.productId)
        );

        const orderItems = order.orderItems.map((item) => ({
          ...item,
          canReview: !reviewedProductIds.has(item.productId),
        }));

        return {
          ...order,
          orderItems,
        };
      });

      return ordersWithReviewStatus;
    }),

  // Create a review
  create: protectedProcedure
    .input(createReviewSchema)
    .mutation(async ({ input, ctx }) => {
      const { orderId, productId, rating, comment } = input;
      const userId = ctx.session?.user?.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a review",
        });
      }

      // Verify the order exists and belongs to the user
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            where: { productId },
          },
        },
      });

      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Order not found",
        });
      }

      if (order.userId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This order does not belong to you",
        });
      }

      // Check if order is delivered and paid
      if (!order.isDelivered) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only review products from delivered orders",
        });
      }

      if (!["capture", "settlement"].includes(order.paymentStatus || "")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can only review products from paid orders",
        });
      }

      // Check if the product is in the order
      if (order.orderItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This product is not in your order",
        });
      }

      // Check if review already exists
      const existingReview = await prisma.review.findUnique({
        where: {
          orderId_productId: {
            orderId,
            productId,
          },
        },
      });

      if (existingReview) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      // Create the review
      const review = await prisma.review.create({
        data: {
          orderId,
          productId,
          userId,
          rating,
          comment,
          isVerifiedPurchase: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return review;
    }),

  // Check if user can review a specific product from an order
  canReview: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        productId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { orderId, productId } = input;
      const userId = ctx.session?.user?.id;

      if (!userId) {
        return { canReview: false, reason: "Not logged in" };
      }

      // Check if order exists and belongs to user
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: {
            where: { productId },
          },
        },
      });

      if (!order) {
        return { canReview: false, reason: "Order not found" };
      }

      if (order.userId !== userId) {
        return { canReview: false, reason: "Order does not belong to you" };
      }

      if (!order.isDelivered) {
        return { canReview: false, reason: "Order not delivered yet" };
      }

      if (!["capture", "settlement"].includes(order.paymentStatus || "")) {
        return { canReview: false, reason: "Order not paid" };
      }

      if (order.orderItems.length === 0) {
        return { canReview: false, reason: "Product not in order" };
      }

      // Check if already reviewed
      const existingReview = await prisma.review.findUnique({
        where: {
          orderId_productId: {
            orderId,
            productId,
          },
        },
      });

      if (existingReview) {
        return { canReview: false, reason: "Already reviewed" };
      }

      return { canReview: true };
    }),

  // Count unreviewable products for a user
  countUnreviewed: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { userId } = input;

      // Get all paid orders for the user (we'll check delivery status below)
      const orders = await prisma.order.findMany({
        where: {
          userId,
          paymentStatus: {
            in: ["capture", "settlement"],
          },
        },
        include: {
          orderItems: {
            select: {
              productId: true,
            },
          },
          reviews: {
            select: {
              productId: true,
            },
          },
        },
      });

      // Count total unreviewable products
      let unreviewedCount = 0;

      for (const order of orders) {
        // Check actual delivery status from shippingInfo (prioritize this over isDelivered flag)
        // If shippingInfo exists, use its currentStatus, otherwise fall back to isDelivered
        const shippingInfo = order.shippingInfo as any;
        const actuallyDelivered = shippingInfo?.currentStatus
          ? shippingInfo.currentStatus === "delivered"
          : order.isDelivered;

        // Skip if not actually delivered
        if (!actuallyDelivered) {
          continue;
        }

        // Get reviewed product IDs for this order
        const reviewedProductIds = new Set(order.reviews.map((r) => r.productId));

        // Count products that haven't been reviewed
        const unreviewedInOrder = order.orderItems.filter(
          (item) => !reviewedProductIds.has(item.productId)
        );

        unreviewedCount += unreviewedInOrder.length;
      }

      return { count: unreviewedCount };
    }),
});
