'use server'

import { SubCategoryFormType } from "@/app/admin/catalog/sub-category/page"
import prisma from "../db/prisma"
import { revalidatePath } from "next/cache"

export async function getSubCategories(categoryId: string){
  return await prisma.subCategory.findMany({
    where: {
      categoryId
    },
  })
}

export async function getSubCategoryById(id: string) {
  return await prisma.subCategory.findFirst({
    where: {
      id
    },
    include: {
      category: {
        select: {
          id: true,
          name: true
        }
      },
      products: {
        select: {
          id: true,
          name: true
        }
      }
    }
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

    revalidatePath("/admin/catalog/sub-category");
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

    revalidatePath("/admin/catalog/sub-category");
  } catch (error) {
    console.log("DELETE_SUBCATEGORY_ERROR:", error);
    return null;
  }
}

export async function createSubCategory(data: SubCategoryFormType) {
  try {
    const {category, name, discount, image, products} = data
    
    await prisma.$transaction(async (tx)=>{
      await tx.subCategory.create({
        data: {
          name,
          categoryId: category.value,
          discount,
          image,
          products: {
            connect: products?.map((product) => ({
              id: product.value
            })) ?? []
          }
        },
      })
  
      await tx.product.updateMany({
        where: {
          id: {
            in: products?.map((p)=>p.value) ?? []
          }
        },
        data: {
          discount,
        },
      })
  
      await tx.variant.updateMany({
        where: {
          productId: {
            in: products?.map((p)=>p.value) ?? []
          }
        },
        data: {
          discount
        }
      })
    })

    revalidatePath('/admin/catalog/sub-category')

    return {
      success: true,
      message: 'Sub Category Created'
    }
  } catch (error) {
    console.log(error)
    return{
      success: false,
      message: 'Failed Create Sub Category'
    }
  }
}

export async function updateSubCategory(data: SubCategoryFormType & { id?: string }) {
  try {
    const { category, name, discount, image, products, id } = data
    
    if (!id) {
      throw new Error("Sub Category ID is required")
    }

    await prisma.$transaction(async (tx) => {
      await tx.subCategory.update({
        where: {
          id
        },
        data: {
          name,
          categoryId: category.value,
          discount,
          image,
          products: {
            connect: products?.map((product) => ({
              id: product.value
            })) ?? []
          }
        },
      })
  
      await tx.product.updateMany({
        where: {
          id: {
            in: products?.map((p) => p.value) ?? []
          }
        },
        data: {
          discount,
        },
      })
  
      await tx.variant.updateMany({
        where: {
          productId: {
            in: products?.map((p) => p.value) ?? []
          }
        },
        data: {
          discount
        }
      })
    })

    revalidatePath('/admin/catalog/sub-category')

    return {
      success: true,
      message: 'Sub Category Updated'
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      message: 'Failed to Update Sub Category'
    }
  }
}