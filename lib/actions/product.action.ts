'use server'

import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from "next/cache";
import { prisma } from "../db/prisma"
import { convertToPlainObject } from "../utils";

export async function getAllCategories(){
  'use cache'
  cacheTag('categories')
  cacheLife('days')
  return await prisma.category.findMany()
}

export async function getAllProducts(
  category?: string,
  search?: string,
  categoriesId?: string[],
  banner?: string,
  sort?: string,
  price?: { min?: string; max?: string }
) {
  'use cache'
  cacheTag("products")
  cacheLife('days')

  const products = await prisma.product.findMany({
    where: {
      AND: [
        // Filter berdasarkan kategori (cari produk yang memiliki kategori dengan nama tertentu)
        category
          ? {
              categories: {
                some: { name: { contains: category, mode: "insensitive" } },
              },
            }
          : {},
        // Filter berdasarkan nama produk
        search && search.length !== 0
          ? { name: { contains: search, mode: "insensitive" } }
          : {},
        // Filter berdasarkan kategori ID (produk yang memiliki kategori dalam array ini)
        categoriesId?.length
          ? {
              categories: {
                some: { id: { in: categoriesId } },
              },
            }
          : {},
        // Filter berdasarkan banner
        banner ? { 
          banner: { 
            equals: banner === "exclusive" ? "Exclusive": banner === "best-seller" ? "Best Seller" : "New Arrival"
          } 
        } : {},
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
      categories: true,
    },

    orderBy: sort ? {
      createdAt: 'desc'
    } : {
      name: 'asc'
    }
  })

  return (
    products.map(product => ({
      ...product,
      weight: product.weight ? Number(product.weight) : null,
      width: product.width ? Number(product.width) : null,
      height: product.height ? Number(product.height) : null,
      length: product.length ? Number(product.length) : null,
    }))
  )
}

export async function searchProduct(keyword:string) {
  return await prisma.product.findMany({
    where: {
      name: {
        contains : keyword,
        mode: 'insensitive'
      },
    },
    select: {
      name: true,
      images: true,
      price: true,
      id: true,
      slug: true,
    }
  })
}

export async function getProductBySlug(slug:string) {
  'use cache'
  cacheTag('productBySlug')
  cacheLife('days')

  const product = await prisma.product.findFirst({
    where: {
      slug
    },
    include: {
      categories: true,
      variant: true,
    }
  })
  
  return (
    convertToPlainObject({
      ...product,
      weight: product?.weight ? Number(product.weight) : null,
      width: product?.width ? Number(product.width) : null,
      height: product?.height ? Number(product.height) : null,
      length: product?.length ? Number(product.length) : null,
    })
  )
}

export async function getNewArrivalProduct() {
  'use cache'
  cacheTag('newArrivalProducts')
  cacheLife('days')
  return await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      name: true,
      price: true,
      slug: true,
      images: true
    },
    take: 2
  })
}