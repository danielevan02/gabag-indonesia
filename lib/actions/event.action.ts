"use server";

import { revalidatePath } from "next/cache";

import { EventFormType } from "@/app/admin/event/add/components/event-form";
import prisma from "../db/prisma";
import { serializeType } from "../utils";

export async function getAllEvents() {
  return await prisma.event.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
}

export async function getFlashSaleProducts() {
  const data = await prisma.product.findMany({
    where: {
      eventId: "be32be21-13c2-4ed7-aaa2-861477ebb11f",
    },
    include: {
      subCategory: true,
      event: true,
      variants: true,
    },
  });

  const serializeData = serializeType(data)

  // return [
  //   ...products.map((product) => ({
  //     ...product,
  //     variants: product?.variants.map((variant) => ({
  //       ...variant,
  //       discount: variant.discount as number | undefined,
  //       sku: variant.sku as string | undefined,
  //       regularPrice: Number(variant.regularPrice),
  //       price:
  //         Number(variant.regularPrice) -
  //         Number(variant.regularPrice) * (((variant.discount || product.discount) ?? 0) / 100),
  //     })),
  //     weight: Number(product.weight),
  //     length: Number(product.length),
  //     width: Number(product.width),
  //     height: Number(product.height),
  //     sku: product.sku as string | undefined,
  //     eventId: product.eventId as string | undefined,
  //     regularPrice: Number(product.regularPrice),
  //     event: product.event as PrismaEvent | undefined,
  //     price: Number(product.regularPrice) - (Number(product.regularPrice) * product.discount) / 100,
  //   })),
  // ];

  return serializeData.map((product) => ({
    ...product,
    image: product.images[0],
    price: product.regularPrice - product.regularPrice*(product.discount/100),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.regularPrice - variant.regularPrice*((variant.discount??0)/100)
    })),
  }))
}

export async function createEvents(data: EventFormType) {
  const { discount, name, products } = data;

  try {
    await prisma.event.create({
      data: {
        name,
        discount,
        products: {
          connect: products?.map((prod) => ({ id: prod.value })),
        },
      },
    });

    return {
      status: 200,
      message: "Events Created!",
    };
  } catch (error) {
    console.log("ERROR_CREATE_EVENT ", error);
    return {
      status: 501,
      message: "Failed creating events",
    };
  }
}

export async function deleteManyEvents(ids: string[]) {
  try {
    await prisma.event.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    revalidatePath("/admin/events");

    return {
      success: true,
      message: "Events Deleted",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to Delete Event",
    };
  }
}

export async function deleteEvent(id: string) {
  try {
    await prisma.event.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log("DELETE_EVENT_ERROR:", error);
    return null;
  }
}
