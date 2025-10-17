import { z } from "zod";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { subCategorySchema } from "@/lib/schema";

const handleMutationError = (error: unknown, operation: string) => {
  console.error(`${operation} error:`, error);
  return {
    success: false,
    message: `Failed to ${operation}`,
  };
};

const handleMutationSuccess = (message: string) => {
  return {
    success: true,
    message,
  };
};

export const subCategoryRouter = createTRPCRouter({
  getSelect: baseProcedure.input(z.string().optional()).query(async ({ input }) => {
    return prisma.subCategory.findMany({
      where: input
        ? {
            categoryId: input,
          }
        : {},
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { category: { name: 'asc' } },
        { name: 'asc' },
      ],
    });
  }),
  // Get sub categories by category ID
  getByCategory: baseProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.subCategory.findMany({
        where: {
          categoryId: input.categoryId,
        },
      });

      return serializeType(data);
    }),

  // Get sub category by ID
  getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const data = await prisma.subCategory.findFirst({
      where: {
        id: input.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Sub category not found",
      });
    }

    return serializeType(data);
  }),

  // Get all sub categories
  getAll: baseProcedure.query(async () => {
    const data = await prisma.subCategory.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
        category: true,
        mediaFile: {
          select: {
            secure_url: true,
          },
        },
      },
    });

    return serializeType(data);
  }),

  display: baseProcedure.query(async () => {
    const data = await prisma.subCategory.findMany({
      select: {
        id: true,
        name: true,
        mediaFile: {
          select: {
            secure_url: true,
          },
        },
        categoryId: true
      },
    });

    return serializeType(data);
  }),
  // Create sub category
  create: adminProcedure.input(subCategorySchema).mutation(async ({ input }) => {
    try {
      const { category, name, discount, mediaFileId, products } = input;

      await prisma.$transaction(async (tx) => {
        await tx.subCategory.create({
          data: {
            name,
            categoryId: category,
            discount,
            mediaFileId,
            products: {
              connect:
                products?.map((product) => ({
                  id: product,
                })) ?? [],
            },
          },
        });

        if (products?.length && discount !== undefined) {
          await tx.product.updateMany({
            where: {
              id: {
                in: products,
              },
            },
            data: {
              discount,
            },
          });

          await tx.variant.updateMany({
            where: {
              productId: {
                in: products,
              },
            },
            data: {
              discount,
            },
          });
        }
      });

      return handleMutationSuccess("Sub Category Created");
    } catch (error) {
      return handleMutationError(error, "Create Sub Category");
    }
  }),

  // Update sub category
  update: adminProcedure
    .input(subCategorySchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { category, name, discount, mediaFileId, products, id } = input;

        await prisma.$transaction(async (tx) => {
          // Get current products in this sub-category
          const currentSubCategory = await tx.subCategory.findUnique({
            where: { id },
            include: { products: { select: { id: true } } },
          });

          const currentProductIds = currentSubCategory?.products.map((p) => p.id) || [];
          const newProductIds = products || [];

          // Find products that should be removed from this sub-category
          const toRemove = currentProductIds.filter((id) => !newProductIds.includes(id));

          // Find products that should be added to this sub-category
          const toAdd = newProductIds.filter((id) => !currentProductIds.includes(id));

          // Update sub-category basic info
          await tx.subCategory.update({
            where: { id },
            data: {
              name,
              categoryId: category,
              discount,
              mediaFileId,
            },
          });

          // Add new products to this sub-category
          if (toAdd.length > 0) {
            await tx.product.updateMany({
              where: {
                id: { in: toAdd },
              },
              data: {
                subCategoryId: id,
              },
            });
          }

          // For products being removed, we need to move them to another sub-category
          // Let's find a default sub-category in the same category
          if (toRemove.length > 0) {
            const defaultSubCategory = await tx.subCategory.findFirst({
              where: {
                categoryId: category,
                id: { not: id }, // Not the current one
              },
            });

            if (defaultSubCategory) {
              // Move removed products to the default sub-category
              await tx.product.updateMany({
                where: {
                  id: { in: toRemove },
                },
                data: {
                  subCategoryId: defaultSubCategory.id,
                },
              });
            }
            // If no other sub-category exists, products stay in current sub-category
          }

          if (products?.length && discount !== undefined) {
            await tx.product.updateMany({
              where: {
                id: {
                  in: products,
                },
              },
              data: {
                discount,
              },
            });

            await tx.variant.updateMany({
              where: {
                productId: {
                  in: products,
                },
              },
              data: {
                discount,
              },
            });
          }
        });

        return handleMutationSuccess("Sub Category Updated");
      } catch (error) {
        return handleMutationError(error, "Update Sub Category");
      }
    }),

  // Delete sub category
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      await prisma.subCategory.delete({
        where: {
          id: input.id,
        },
      });

      return handleMutationSuccess("Sub Category Deleted");
    } catch (error) {
      return handleMutationError(error, "Delete Sub Category");
    }
  }),

  // Delete many sub categories
  deleteMany: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.subCategory.deleteMany({
          where: {
            id: {
              in: input.ids,
            },
          },
        });

        return handleMutationSuccess("Sub Categories Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Sub Categories");
      }
    }),
});
