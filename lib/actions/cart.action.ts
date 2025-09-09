"use server";

import { auth } from "@/auth";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError } from "../utils";
import { CartItem } from "@/types";
import prisma from "../db/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0),
    taxPrice = Math.round(0.01 * itemsPrice),
    totalPrice = itemsPrice + taxPrice;
  return {
    itemsPrice: itemsPrice,
    taxPrice: taxPrice,
    totalPrice: totalPrice,
    shippingPrice: 0,
  };
};

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found!");

  const session = await auth();
  const userId = session?.user?.id;

  const cart = await prisma.cart.findFirst({
    where: userId
      ? {
          userId,
        }
      : {
          sessionCartId,
        },
  });

  if (!cart) return undefined;

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    shippingPrice: cart.shippingPrice?.toString(),
    userId,
  });
}

export async function addToCart(item: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const session = await auth();
    const userId = session?.user?.id ? session.user.id : undefined;

    const cart = await getMyCart();

    let message: string;
    // MAKE A NEW CART IF THERE IS NO CART
    if (!cart) {
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
      // CHECK IF THE SELECTED ITEM IS AVAILABLE AT THE CART
      const existItemInCart = cart.items.find((x) =>
        item.variantId
          ? x.productId === item.productId && x.variantId === item.variantId
          : x.productId === item.productId && x.variantId == null
      );

      // IF THERE IS EXISTING ITEMS REFERENCE IN THE CART
      if (existItemInCart) {
        // THIS IS FOR GETTING THE CURRENT STOCK OF EITHER VARIANT OR PRODUCT
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

        // VALIDATING IF CURRENT QTY + ADDED QUANTITY IS MORE THAN CURRENT STOCK
        if (stock) {
          if (existItemInCart.qty + item.qty > stock) throw new Error("Not enough stock!");
        }
        message = `${existItemInCart.name} quantity is updated`;
        existItemInCart.qty += item.qty;
      } else {
        // IF THE SELECTED ITEM IS NOT IN THE CART, THEN PUSH THE ITEM TO THE CART ITEM
        message = `${item.name} is added to cart`;
        cart.items.push(item);
      }

      // UPDATING THE ITEMS CART AND RECALCULATE THE PRICE AFTER ADDING THE QUANTITY
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items,
          ...calcPrice(cart.items),
        },
      });
    }
    revalidatePath(`/products`);
    return {
      success: true,
      message,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: `${error}`,
    };
  }
}

export async function updateCartItem(productId: string, quantity: number, variantId?: string) {
  try {
    if (quantity < 0) throw new Error("Invalid quantity value, received minus");

    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const product = await prisma.product.findFirst({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) throw new Error("Product not found!");

    const existItem = cart.items.find(
      (x) => x.productId === productId && x.variantId === variantId
    );
    if (!existItem) throw new Error("Item not found in cart!");

    const selectedVariant = variantId ? product.variants.find((v) => v.id === variantId) : null;

    if (selectedVariant) {
      if (selectedVariant.stock < quantity) throw `Not enough stock!-${selectedVariant.stock}`;
    } else {
      if (product.stock < quantity) throw `Not enough stock!-${product.stock}`;
    }

    if (quantity === 0) {
      cart.items = cart.items.filter(
        (x) => !(x.productId === productId && x.variantId === variantId)
      );
    }
    existItem.qty = quantity;

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        items: cart.items as Prisma.CartUpdateitemsInput[],
        ...calcPrice(cart.items as CartItem[]),
      },
    });

    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: `${product.name} ${quantity !== 0 ? "added to" : "removed from"} cart!`,
    };
  } catch (error) {
    return { success: false, message: error };
  }
}

export async function deleteCartItem(productId: string, variantId?: string) {
  try {
    const cart = await getMyCart();

    const newCartItems = cart?.items.filter((item) =>
      variantId
        ? item.variantId !== variantId
        : item.productId !== productId
    );

    await prisma.cart.update({
      where: {
        id: cart?.id,
      },
      data: {
        items: newCartItems,
        ...calcPrice(newCartItems||[])
      },
    });

    revalidatePath('/products')

    return {
      success: true,
      message: "Item removed from cart",
    };
  } catch (error) {
    return {
      success: true,
      message: formatError(error),
    };
  }
}
