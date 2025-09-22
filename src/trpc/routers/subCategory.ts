import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
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
  getSelect: baseProcedure.query(async () => {
    return prisma.subCategory.findMany({
      select: {
        id: true,
        name: true
      }
    })
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
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
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
            secure_url: true
          }
        }
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
            secure_url: true
          }
        }
      }
    })

    return serializeType(data)
  }),
  // Create sub category
  create: baseProcedure
    .input(subCategorySchema)
    .mutation(async ({ input }) => {
      try {
        const { category, name, discount, mediaFileId, products } = input;

        await prisma.$transaction(async (tx) => {
          await tx.subCategory.create({
            data: {
              name,
              categoryId: category.id,
              discount,
              mediaFileId,
              products: {
                connect: products?.map((product) => ({
                  id: product.id,
                })) ?? [],
              },
            },
          });

          if (products?.length && discount !== undefined) {
            await tx.product.updateMany({
              where: {
                id: {
                  in: products.map((p) => p.id),
                },
              },
              data: {
                discount,
              },
            });

            await tx.variant.updateMany({
              where: {
                productId: {
                  in: products.map((p) => p.id),
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
  update: baseProcedure
    .input(subCategorySchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { category, name, discount, mediaFileId, products, id } = input;

        await prisma.$transaction(async (tx) => {
          await tx.subCategory.update({
            where: {
              id,
            },
            data: {
              name,
              categoryId: category.id,
              discount,
              mediaFileId,
              products: {
                set: [], // Clear existing connections
                connect: products?.map((product) => ({
                  id: product.id,
                })) ?? [],
              },
            },
          });

          if (products?.length && discount !== undefined) {
            await tx.product.updateMany({
              where: {
                id: {
                  in: products.map((p) => p.id),
                },
              },
              data: {
                discount,
              },
            });

            await tx.variant.updateMany({
              where: {
                productId: {
                  in: products.map((p) => p.id),
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
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
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
  deleteMany: baseProcedure
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