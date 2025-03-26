'use server'

import { auth } from "@/auth";
import { cookies } from "next/headers";
import { convertToPlainObject, formatError } from "../utils";
import { CartItem } from "@/types";
import { prisma } from "../db/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const calcPrice = (items: CartItem[]) => {
  const itemsPrice = items.reduce((acc, item) => acc + Number(item.price)*item.qty, 0),
  taxPrice = 0.10 * itemsPrice,
  totalPrice = itemsPrice+taxPrice,
  weight = items.reduce((curr, item) => curr + Number(item.weight)*item.qty, 0)
  return {
    itemsPrice: itemsPrice,
    taxPrice: taxPrice,
    totalPrice: totalPrice,
    shippingPrice: 0,
    weight: weight
  }
}

export async function getMyCart() {
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart session not found!");

  const session = await auth();
  const userId = session?.user?.id

  const cart = await prisma.cart.findFirst({
    where: userId ? {
      userId
    } : {
      sessionCartId
    }
  })

  if(!cart) return undefined

  return convertToPlainObject({
    ...cart,
    items: cart.items as CartItem[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
    weight: (cart.weight||0).toString(),
    userId
  })
}

export async function addToCart(item: CartItem) {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const session = await auth();
    const userId = session?.user?.id ? session.user.id : undefined;

    const cart = await getMyCart();

    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
      },
      include: {
        variant: true, // Pastikan produk dapat mengambil varian jika ada
      },
    });

    if (!product) throw new Error("Product not found!");

    // Pastikan varian valid jika ada
    let selectedVariant = null;
    if (item.variantId) {
      selectedVariant = product.variant.find(v => v.id === item.variantId);
      if (!selectedVariant) throw new Error("Variant not found!");
      if (selectedVariant.stock < item.qty) throw new Error("Not enough stock!");
    } else {
      if (product.stock < item.qty) throw new Error("Not enough stock!");
    }

    if (!cart) {
      await prisma.cart.create({
        data: {
          sessionCartId,
          userId,
          items: [item],
          ...calcPrice([item]),
        },
      });
    } else {
      const existItem = (cart.items as CartItem[]).find(
        (x) => x.productId === item.productId && x.variantId === item.variantId
      );

      if (existItem) {
        if (selectedVariant) {
          if (selectedVariant.stock < existItem.qty + 1) throw new Error("Not enough stock!");
        } else {
          if (product.stock < existItem.qty + 1) throw new Error("Not enough stock!");
        }
        existItem.qty += 1;
      } else {
        cart.items.push(item);
      }

      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: cart.items as Prisma.CartUpdateitemsInput[],
          ...calcPrice(cart.items as CartItem[]),
        },
      });
    }

    revalidatePath(`/products/${product.slug}`);

    return {
      success: true,
      message: `${product.name} ${item.variantId ? "(Variant Updated)" : "Added to"} cart`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateCartItem(productId: string, variantId?: string, action?: "increase" | "decrease") {
  try {
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart session not found!");

    const cart = await getMyCart();
    if (!cart) throw new Error("Cart not found");

    const product = await prisma.product.findFirst({
      where: { id: productId },
      include: { variant: true },
    });
    if (!product) throw new Error("Product not found!");

    const existItem = cart.items.find(
      (x) => x.productId === productId && x.variantId === variantId
    );
    if (!existItem) throw new Error("Item not found in cart!");

    if (action === "increase") {
      const selectedVariant = variantId
        ? product.variant.find(v => v.id === variantId)
        : null;

      if (selectedVariant) {
        if (selectedVariant.stock < existItem.qty + 1) throw new Error("Not enough stock!");
      } else {
        if (product.stock < existItem.qty + 1) throw new Error("Not enough stock!");
      }
      existItem.qty += 1;
    } else if (action === "decrease") {
      if (existItem.qty === 1) {
        cart.items = cart.items.filter(
          (x) => !(x.productId === productId && x.variantId === variantId)
        );
      } else {
        existItem.qty -= 1;
      }
    }

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
      message: `${product.name} ${action === "increase" ? "added to" : "removed from"} cart!`,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}