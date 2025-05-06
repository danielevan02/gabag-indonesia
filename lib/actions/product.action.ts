'use server'

import { prisma } from "../db/prisma"
import { Product } from "@/types";
import { Event } from '@prisma/client'

export async function getAllProducts(
  subCategory?: string,
  search?: string,
  subCategoriesId?: string[],
  sort?: string,
  price?: { min?: string; max?: string }
): Promise<Product[]> {

  const products = await prisma.product.findMany({
    where: {
      AND: [
        // Filter berdasarkan kategori (cari produk yang memiliki kategori dengan nama tertentu)
        subCategory
          ? {
              subCategory: {
                name: {
                  contains: subCategory,
                  mode: 'insensitive'
                }
              },
            }
          : {},
        // Filter berdasarkan nama produk
        search && search.length !== 0
          ? { name: { contains: search, mode: "insensitive" } }
          : {},
        // Filter berdasarkan kategori ID (produk yang memiliki kategori dalam array ini)
        subCategoriesId?.length
          ? {
              subCategoryId: {
                in: subCategoriesId ,
              },
            }
          : {},
        // Filter berdasarkan harga (min dan max)
        price?.min || price?.max
          ? {
            price: {
              gte: price?.min ? BigInt(price.min) : undefined,
              lte: price?.max ? BigInt(price.max) : undefined,
            },
            }
          : {},
      ],
    },
    include: {
      subCategory: true,
      event: true,
      variants: true
    },

    orderBy: sort ? {
      createdAt: 'desc'
    } : {
      name: 'asc'
    }
  })

  return [
    ...products.map((product) => ({
      ...product,
      variants: product?.variants.map((variant) => ({
        ...variant,
        discount: variant.discount as number | undefined,
        sku: variant.sku as string | undefined,
        regularPrice: Number(variant.regularPrice),
        price: Number(variant.regularPrice) - Number(variant.regularPrice)*(variant.discount||0/100)
      })),
      weight: Number(product.weight),
      length: Number(product.length),
      width: Number(product.width),
      height: Number(product.height),
      sku: product.sku as string | undefined,
      eventId: product.eventId as string | undefined,
      regularPrice: Number(product.regularPrice),
      event: product.event as Event | undefined,
      price: Number(product.regularPrice) - (Number(product.regularPrice)*product.discount/100)
    }))
  ]
}

export async function searchProduct(keyword:string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      name: {
        contains : keyword,
        mode: 'insensitive'
      },
    },
  })

  return [
    ...products.map((product) => ({
      ...product,
      weight: Number(product.weight),
      length: Number(product.length),
      width: Number(product.width),
      height: Number(product.height),
      sku: product.sku as string | undefined,
      eventId: product.eventId as string | undefined,
      regularPrice: Number(product.regularPrice),
      price: Number(product.regularPrice) - (Number(product.regularPrice)*product.discount/100)
    }))
  ]
}

export async function getProductBySlug(slug:string): Promise<Product> {

  const product = await prisma.product.findFirst({
    where: {
      slug
    },
    include: {
      subCategory: true,
      variants: true,
      orderItems: {
        where: {
          order: {
            paymentStatus: {
              in: ['settlement', 'capture']
            }
          }
        },
      }
    }
  })
  
  return {
    ...product!,
    variants: product?.variants.map((variant) => ({
      ...variant,
      discount: variant.discount as number | undefined,
      sku: variant.sku as string | undefined,
      regularPrice: Number(variant.regularPrice),
      price: Number(variant.regularPrice) - Number(variant.regularPrice)*(variant.discount||0/100)
    })),
    orderItems: product?.orderItems.map((item) => ({
      ...item,
      weight: Number(item.weight)
    })),
    weight: Number(product?.weight),
    length: Number(product?.length),
    width: Number(product?.width),
    height: Number(product?.height),
    sku: product?.sku as string | undefined,
    eventId: product?.eventId as string | undefined,
    regularPrice: Number(product?.regularPrice),
    price: Number(product?.regularPrice) - (Number(product?.regularPrice)*(product?.discount||0)/100)
  }
}

export async function getNewArrivalProduct(): Promise<Product[]> {

  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 2
  })

  return [
    ...products.map((product) => ({
      ...product,
      weight: Number(product.weight),
      length: Number(product.length),
      width: Number(product.width),
      height: Number(product.height),
      sku: product.sku as string | undefined,
      eventId: product.eventId as string | undefined,
      regularPrice: Number(product.regularPrice),
      price: Number(product.regularPrice) - (Number(product.regularPrice)*product.discount/100)
    }))
  ]
}