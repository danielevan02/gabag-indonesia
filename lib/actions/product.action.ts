'use server'

import { prisma } from "../db/prisma"

export async function getAllProducts(category?: string) {
  if(!category) {
    return await prisma.product.findMany()
  }
}