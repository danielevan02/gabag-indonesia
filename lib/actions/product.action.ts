'use server'

import { prisma } from "../db/prisma"

export async function getAllCategories(){
  return await prisma.category.findMany()
}

export async function getAllProducts(category?: string) {
  if(!category){
    return await prisma.product.findMany({
      include: {
        categories: true
      }
    })
  } else if(category){
    return await prisma.product.findMany({
      where: {
        categories: {
          some: {
            name: category
          }
        }
      },
      include: {
        categories: true
      }
    })
  }
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