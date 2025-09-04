"use server";

import { prisma } from "../db/prisma";
import { CategoryFormType } from "@/app/admin/catalog/category/[categoryId]/components/edit-category-form";

export async function getAllCategories() {
  return await prisma.category.findMany({
    include: {
      subCategories: true,
    },
  });
}

export async function getCategoryById(id: string) {
  return await prisma.category.findUnique({
    where: {
      id,
    },
  });
}

export async function updateCategory(data: CategoryFormType & { id: string }) {
  const {id, image, name} = data

  try {
    if (!id) {
      throw new Error("Sub Category ID is required")
    } 

    await prisma.category.update({
      where: {
        id
      }, 
      data: {
        name,
        image
      }
    })

    return {
      success: true,
      message: "Category Updated"
    }
  } catch (error) {
    console.log("UPDATE_CATEGORY_ERROR ", error)
    return {
      success: false,
      message: "Failed to Update Category"
    }
  }
}

export async function deleteCategory(id: string) {
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

export async function deleteManyCategories(categoryIds: string[]) {
  try {
    await prisma.category.deleteMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });
  } catch (error) {
    console.log("ERROR_DELETE_MANY_CATEGORY: ", error);
  }
}

export async function getCategory(id?: string) {
  return await prisma.category.findFirst({
    where: {
      id,
    },
    include: {
      subCategories: true,
    },
  });
}
