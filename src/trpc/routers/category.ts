import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { categorySchema } from "@/lib/schema";

// Category schemas


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

export const categoryRouter = createTRPCRouter({
  getSelect: baseProcedure.query(async () => {
    return await prisma.category.findMany({
      select: {
        id: true,
        name: true
      }
    })
  }),
  // Get all categories
  getAll: baseProcedure.query(async () => {
    const data = await prisma.category.findMany({
      include: {
        subCategories: true,
      },
    });

    return serializeType(data);
  }),

  // Get category by ID
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.category.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return serializeType(data);
    }),

  // Get category with sub categories
  getCategory: baseProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input }) => {
      const data = await prisma.category.findFirst({
        where: {
          id: input.id,
        },
        include: {
          subCategories: true,
        },
      });

      if (!data && input.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      return serializeType(data);
    }),

  // Update category
  update: baseProcedure
    .input(categorySchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id, image, name } = input;

        if (!id) {
          throw new Error("Category ID is required");
        }

        await prisma.category.update({
          where: {
            id,
          },
          data: {
            name,
            image,
          },
        });

        return handleMutationSuccess("Category Updated");
      } catch (error) {
        return handleMutationError(error, "Update Category");
      }
    }),

  // Delete category
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.category.delete({
          where: {
            id: input.id,
          },
        });

        return handleMutationSuccess("Category Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Category");
      }
    }),

  // Delete many categories
  deleteMany: baseProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.category.deleteMany({
          where: {
            id: {
              in: input.ids,
            },
          },
        });

        return handleMutationSuccess("Categories Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Categories");
      }
    }),
});