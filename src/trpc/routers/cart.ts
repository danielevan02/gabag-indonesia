import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { auth } from "@/auth"
import { CartItem } from "@/types";

// Helper function to calculate cart prices
const calcPrice = (items: CartItem[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
  const taxPrice = Math.round(0.01 * itemsPrice);
  const totalPrice = itemsPrice + taxPrice;

  return {
    itemsPrice: itemsPrice,
    taxPrice: taxPrice,
    totalPrice: totalPrice,
    shippingPrice: 0,
  };
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

  if (!cart) return undefined;

  return serializeType({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    shippingPrice: cart.shippingPrice?.toString(),
    userId,
  });
};

// Cart item input schema
const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  category: z.string(),
  image: z.string(),
  price: z.number(),
  qty: z.number(),
});

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
    .input(z.object({
      item: cartItemSchema,
    }))
    .mutation(async ({ input }) => {
      try {
        const { item } = input;

        const session = await auth();
        const userId = session?.user?.id;

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

          message = `${item.name} is added to cart`;
          await prisma.cart.create({
            data: {
              sessionCartId,
              userId,
              items: [item],
              ...calcPrice([item]),
            },
          });
        } else {
          // Check if item already exists in cart
          const existItemInCart = cart.items.find((x) =>
            item.variantId
              ? x.productId === item.productId && x.variantId === item.variantId
              : x.productId === item.productId && x.variantId == null
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
            if (stock && existItemInCart.qty + item.qty > stock) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Not enough stock!",
              });
            }

            message = `${existItemInCart.name} quantity is updated`;
            existItemInCart.qty += item.qty;
          } else {
            message = `${item.name} is added to cart`;
            cart.items.push(item);
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