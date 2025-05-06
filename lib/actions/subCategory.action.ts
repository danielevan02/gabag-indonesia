'use server'

import { prisma } from "../db/prisma"

export async function getSubCategories(categoryId: string){
  return await prisma.subCategory.findMany({
    where: {
      categoryId
    },
  })
}

export async function getAllSubCategories() {
  return await prisma.subCategory.findMany({
    include: {
      _count: {
        select: {
          products: true
        }
      },
      category: true
    }
  })
}

export async function deleteManySubCategories(subCategoryIds: string[]) {
  try {
    await prisma.category.deleteMany({
      where: {
        id: {
          in: subCategoryIds
        }
      }
    })
  } catch (error) {
    console.log('ERROR_DELETE_MANY_SUB-CATEGORY: ', error)
  }
}

export async function deleteSubCategory(id:string) {
  try {
    await prisma.subCategory.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log("DELETE_SUBCATEGORY_ERROR:", error);
    return null;
  }
}