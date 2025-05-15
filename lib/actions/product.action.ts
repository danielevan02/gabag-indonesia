'use server'

import { prisma } from "../db/prisma"
import { Product } from "@/types";
import { Event } from '@prisma/client'
import { ProductFormType } from "@/app/admin/catalog/product/add/components/product-form"
import { revalidatePath } from "next/cache"

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
        price: Number(variant.regularPrice) - Number(variant.regularPrice)*((variant.discount??0)/100)
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

export async function getProductById(id: string) {
  return await prisma.product.findFirst({
    where: {
      id
    },
    include: {
      subCategory: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })
}

export async function createProduct(data: ProductFormType) {
  try {
    const { subCategory, name, price, discount, image, description, slug, hasVariant, variants } = data
    
    await prisma.product.create({
      data: {
        name: name!,
        slug: slug!,
        subCategoryId: subCategory?.value ?? "",
        regularPrice: hasVariant ? 0 : price,
        discount,
        images: image,
        description: description!,
        hasVariant,
        variants: hasVariant ? {
          create: variants?.map(variant => ({
            name: variant.name,
            sku: variant.sku,
            regularPrice: variant.price,
            stock: variant.stock,
            discount: variant.discount
          }))
        } : undefined
      },
    })

    revalidatePath('/admin/catalog/product')

    return {
      success: true,
      message: 'Product Created'
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: 'Failed to Create Product'
    }
  }
}

export async function updateProduct(data: ProductFormType & { id?: string }) {
  try {
    const { subCategory, name, price, discount, image, description, id, hasVariant, variants } = data
    
    if (!id) {
      throw new Error("Product ID is required")
    }

    await prisma.product.update({
      where: {
        id
      },
      data: {
        name,
        subCategoryId: subCategory?.value,
        regularPrice: hasVariant ? 0 : price,
        discount,
        images: image,
        description,
        hasVariant,
        variants: hasVariant ? {
          deleteMany: {},
          create: variants?.map(variant => ({
            name: variant.name,
            sku: variant.sku,
            regularPrice: variant.price,
            stock: variant.stock,
            discount: variant.discount
          }))
        } : undefined
      },
    })

    revalidatePath('/admin/catalog/product')

    return {
      success: true,
      message: 'Product Updated'
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: 'Failed to Update Product'
    }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: {
        id
      }
    })

    revalidatePath('/admin/catalog/product')

    return {
      success: true,
      message: 'Product Deleted'
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: 'Failed to Delete Product'
    }
  }
}

export async function deleteManyProducts(ids: string[]) {
  try {
    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    revalidatePath('/admin/catalog/product')

    return {
      success: true,
      message: 'Products Deleted'
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: 'Failed to Delete Products'
    }
  }
}