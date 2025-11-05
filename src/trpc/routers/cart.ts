import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { auth } from "../../auth"
import { CartItem } from "@/types";
import { cartItemSchema } from "@/lib/schema";
import { roundPrice, calculateTax } from "@/services/pricing.service";

// Helper function to calculate cart prices (legacy - kept for backward compatibility)
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  const taxPrice = calculateTax(itemsPrice);
  const totalPrice = itemsPrice + taxPrice;

  return {
    itemsPrice: itemsPrice,
    taxPrice: taxPrice,
    totalPrice: totalPrice,
    shippingPrice: 0,
  };
};

// Helper function to validate and update cart prices based on active campaigns
const validateCartPrices = async (cart: any) => {
  const now = new Date();
  let priceUpdated = false;

  const updatedItems = await Promise.all(
    (cart.items as CartItem[]).map(async (item) => {
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

      if (!product) return item;

      let validatedPrice = item.price;

      // Calculate correct price based on highest priority campaign
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) return item;

        // Find variant-specific campaign (already sorted by priority desc)
        // .find() will return the first match = highest priority
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
          // No variant-specific campaign, check for product-wide campaign
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
            validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * ((variant.discount || 0) / 100)));
          }
        }
      } else {
        // Product without variant - check for product-wide campaign
        // .find() returns first match = highest priority
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
          validatedPrice = roundPrice(Number(product.regularPrice) - (Number(product.regularPrice) * ((product.discount || 0) / 100)));
        }
      }

      // Check if price changed (both prices are already rounded integers)
      if (Math.abs(validatedPrice - item.price) > 1) {
        priceUpdated = true;
      }

      return {
        ...item,
        price: validatedPrice,
      };
    })
  );

  return { updatedItems, priceUpdated };
};

// Helper function to get cart
export const getCartHelper = async (userId?: string) => {
  const { cookies } = await import("next/headers");
  const cookiesObject = await cookies();
  const sessionCartId = cookiesObject.get("sessionCartId")?.value;

  const cart = await prisma.cart.findFirst({
    where: userId
      ? { userId }
      : { sessionCartId },
  });

  if (!cart) return null;

  // Validate and update prices based on active campaigns
  const { updatedItems, priceUpdated } = await validateCartPrices(cart);

  // Update cart in database if prices changed
  if (priceUpdated) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: updatedItems,
        ...calcPrice(updatedItems),
      },
    });
  }

  return serializeType({
    ...cart,
    items: updatedItems as CartItem[],
    itemsPrice: priceUpdated ? calcPrice(updatedItems).itemsPrice.toString() : cart.itemsPrice.toString(),
    totalPrice: priceUpdated ? calcPrice(updatedItems).totalPrice.toString() : cart.totalPrice.toString(),
    taxPrice: priceUpdated ? calcPrice(updatedItems).taxPrice.toString() : cart.taxPrice.toString(),
    shippingPrice: cart.shippingPrice?.toString(),
    userId,
  });
};

export const cartRouter = createTRPCRouter({
  // Get current user's cart
  getMyCart: baseProcedure
    .query(async () => {
      try {
        const session = await auth();
        const userId = session?.user?.id;

        return await getCartHelper(userId);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get cart",
        });
      }
    }),

  // Add item to cart
  addToCart: baseProcedure
    .input(cartItemSchema)
    .mutation(async ({ input: item }) => {
      try {

        const session = await auth();
        const userId = session?.user?.id;

        // Validate and recalculate price based on active campaigns
        const now = new Date();
        let validatedPrice = item.price;

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
            message: "Product not found!",
          });
        }

        // Calculate correct price based on highest priority campaign
        if (item.variantId) {
          // Variant product
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Variant not found!",
            });
          }

          // Check if variant is in campaign (already sorted by priority desc)
          // .find() will return the first match = highest priority campaign
          const variantCampaignItem = product.campaignItems.find(
            (ci) => ci.variantId === item.variantId
          );

          if (variantCampaignItem) {
            // Apply campaign discount
            const discount = variantCampaignItem.customDiscount || variantCampaignItem.campaign.defaultDiscount;
            const discountType = variantCampaignItem.customDiscountType || variantCampaignItem.campaign.discountType;

            if (discountType === "PERCENT") {
              validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * (discount / 100)));
            } else {
              validatedPrice = roundPrice(Number(variant.regularPrice) - discount);
            }
          } else {
            // No variant-specific campaign, check if whole product is in campaign
            // .find() returns first match = highest priority
            const productCampaignItem = product.campaignItems.find((ci) => !ci.variantId);
            if (productCampaignItem) {
              const discount = productCampaignItem.customDiscount || productCampaignItem.campaign.defaultDiscount;
              const discountType = productCampaignItem.customDiscountType || productCampaignItem.campaign.discountType;

              if (discountType === "PERCENT") {
                validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * (discount / 100)));
              } else {
                validatedPrice = roundPrice(Number(variant.regularPrice) - discount);
              }
            } else {
              // Use variant's own discount
              validatedPrice = roundPrice(Number(variant.regularPrice) - (Number(variant.regularPrice) * ((variant.discount || 0) / 100)));
            }
          }
        } else {
          // Product without variant - check if in campaign (already sorted by priority desc)
          // .find() returns first match = highest priority campaign
          const productCampaignItem = product.campaignItems.find((ci) => !ci.variantId);

          if (productCampaignItem) {
            const discount = productCampaignItem.customDiscount || productCampaignItem.campaign.defaultDiscount;
            const discountType = productCampaignItem.customDiscountType || productCampaignItem.campaign.discountType;

            if (discountType === "PERCENT") {
              validatedPrice = roundPrice(Number(product.regularPrice) - (Number(product.regularPrice) * (discount / 100)));
            } else {
              validatedPrice = roundPrice(Number(product.regularPrice) - discount);
            }
          } else {
            // Use product's own discount
            validatedPrice = roundPrice(Number(product.regularPrice) - (Number(product.regularPrice) * ((product.discount || 0) / 100)));
          }
        }

        // Update item with validated price
        const validatedItem = { ...item, price: validatedPrice };

        // Get sessionCartId from cookies inside getCartHelper
        const cart = await getCartHelper(userId);

        let message: string;

        // Create new cart if none exists
        if (!cart) {
          const { cookies } = await import("next/headers");
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (!sessionCartId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cart session not found!",
            });
          }

          message = `${validatedItem.name} is added to cart`;
          await prisma.cart.create({
            data: {
              sessionCartId,
              userId,
              items: [validatedItem],
              ...calcPrice([validatedItem]),
            },
          });
        } else {
          // Check if item already exists in cart
          const existItemInCart = cart.items.find((x) =>
            validatedItem.variantId
              ? x.productId === validatedItem.productId && x.variantId === validatedItem.variantId
              : x.productId === validatedItem.productId && x.variantId == null
          );

          if (existItemInCart) {
            // Get current stock
            let stock;
            if (existItemInCart.variantId) {
              stock = (
                await prisma.variant.findFirst({
                  where: { id: existItemInCart.variantId },
                  select: { stock: true },
                })
              )?.stock;
            } else {
              stock = (
                await prisma.product.findFirst({
                  where: { id: existItemInCart.productId },
                  select: { stock: true },
                })
              )?.stock;
            }

            // Validate stock
            if (stock && existItemInCart.qty + validatedItem.qty > stock) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Not enough stock!",
              });
            }

            message = `${existItemInCart.name} quantity is updated`;
            existItemInCart.qty += validatedItem.qty;
            // Update price to latest campaign price
            existItemInCart.price = validatedItem.price;
          } else {
            message = `${validatedItem.name} is added to cart`;
            cart.items.push(validatedItem);
          }

          // Update cart
          await prisma.cart.update({
            where: { id: cart.id },
            data: {
              items: cart.items,
              ...calcPrice(cart.items),
            },
          });
        }

        return {
          success: true,
          message,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to add to cart",
        });
      }
    }),

  // Update cart item quantity
  updateCartItem: baseProcedure
    .input(z.object({
      productId: z.string(),
      quantity: z.number(),
      variantId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { productId, quantity, variantId } = input;

        if (quantity < 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid quantity value, received minus",
          });
        }

        const session = await auth();
        const userId = session?.user?.id;

        const cart = await getCartHelper(userId);
        if (!cart) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }

        const product = await prisma.product.findFirst({
          where: { id: productId },
          include: { variants: true },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found!",
          });
        }

        const existItem = cart.items.find(
          (x) => x.productId === productId && x.variantId === variantId
        );

        if (!existItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Item not found in cart!",
          });
        }

        const selectedVariant = variantId ? product.variants.find((v) => v.id === variantId) : null;

        // Check stock
        if (selectedVariant) {
          if (selectedVariant.stock < quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Not enough stock! Available: ${selectedVariant.stock}`,
            });
          }
        } else {
          if (product.stock < quantity) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Not enough stock! Available: ${product.stock}`,
            });
          }
        }

        // Remove item if quantity is 0
        if (quantity === 0) {
          cart.items = cart.items.filter(
            (x) => !(x.productId === productId && x.variantId === variantId)
          );
        } else {
          existItem.qty = quantity;
        }

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: cart.items,
            ...calcPrice(cart.items as CartItem[]),
          },
        });

        return {
          success: true,
          message: `${product.name} ${quantity !== 0 ? "updated in" : "removed from"} cart!`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to update cart item",
        });
      }
    }),

  // Delete cart item
  deleteCartItem: baseProcedure
    .input(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const { productId, variantId } = input;

        const session = await auth();
        const userId = session?.user?.id;

        const cart = await getCartHelper(userId);

        if (!cart) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cart not found",
          });
        }

        const newCartItems = cart.items.filter((item) =>
          variantId
            ? item.variantId !== variantId
            : item.productId !== productId
        );

        await prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: newCartItems,
            ...calcPrice(newCartItems || []),
          },
        });

        return {
          success: true,
          message: "Item removed from cart",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to delete cart item",
        });
      }
    }),
});