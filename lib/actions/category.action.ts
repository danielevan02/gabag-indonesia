'use server'

import { prisma } from "../db/prisma";

export async function getAllCategories(){
  return await prisma.category.findMany({
    include: {
      subCategories: true,
    }
  })
}

export async function deleteCategory(id:string) {
  try {
    await prisma.category.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log("DELETE_CATEGORY_ERROR:", error);
    return null;
  }
}

export async function deleteManyCategories(categoryIds: string[]){
  try {
    await prisma.category.deleteMany({
      where: {
        id: {
          in: categoryIds
        }
      }
    })
  } catch (error) {
    console.log('ERROR_DELETE_MANY_CATEGORY: ', error)
  }
}

export async function getCategory(id?: string) {
  return await prisma.category.findFirst({
    where: {
      id
    },
    include: {
      subCategories: true
    }
  })
}
