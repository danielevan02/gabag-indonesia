'use server'

import { prisma } from "../db/prisma"

export async function getAllCategories(){
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
  
  return await prisma.product.findMany({
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
  });
}



export async function searchProduct(keyword:string) {
  return await prisma.product.findMany({
    where: {
      name: {
        contains : keyword,
        mode: 'insensitive'
      },
    }
  })
}

export async function getProductBySlug(slug:string) {
  return await prisma.product.findFirst({
    where: {
      slug
    }
  })
}

export async function getNewArrivalProduct() {
  return await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 2
  })
}