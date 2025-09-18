import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { productSchema } from "@/lib/schema";
import { TRPCError } from "@trpc/server";

// Constants
const DEFAULT_NEW_ARRIVALS_LIMIT = 2;

// Types
type Product = {
  regularPrice: number;
  discount?: number;
};

type Variant = {
  regularPrice: number;
  discount?: number;
};

type ProductWithVariants = Product & {
  variants: Variant[];
  images: string[];
};

// Helper functions
const calculateDiscountedPrice = (regularPrice: number, discount?: number): number => {
  if (!discount) return regularPrice;
  return regularPrice - (regularPrice * (discount / 100));
};

const transformProductWithPrice = (product: ProductWithVariants) => {
  return {
    ...product,
    price: calculateDiscountedPrice(product.regularPrice, product.discount),
    image: product.images[0],
    variants: product.variants.map((variant) => ({
      ...variant,
      price: calculateDiscountedPrice(variant.regularPrice, variant.discount),
    })),
  };
};

const transformProductList = (products: ProductWithVariants[]) => {
  return products.map(transformProductWithPrice);
};

const buildProductFilters = (filters: {
  subCategory?: string;
  search?: string;
  subCategoriesId?: string[];
  price?: { min?: string; max?: string };
}) => {
  const { subCategory, search, subCategoriesId, price } = filters;

  return {
    AND: [
      subCategory
        ? {
            subCategory: {
              name: {
                contains: subCategory,
                mode: "insensitive" as const,
              },
            },
          }
        : {},
      search && search.length > 0
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {},
      subCategoriesId?.length
        ? {
            subCategoryId: {
              in: subCategoriesId,
            },
          }
        : {},
      price?.min || price?.max
        ? {
            regularPrice: {
              gte: price?.min ? BigInt(price.min) : undefined,
              lte: price?.max ? BigInt(price.max) : undefined,
            },
          }
        : {},
    ],
  };
};

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

export const productRouter = createTRPCRouter({
  // Get all products with filters
  getAll: baseProcedure
    .input(
      z.object({
        subCategory: z.string().optional(),
        search: z.string().optional(),
        subCategoriesId: z.array(z.string()).optional(),
        sort: z.string().optional(),
        price: z
          .object({
            min: z.string().optional(),
            max: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      const data = await prisma.product.findMany({
        where: buildProductFilters(input),
        include: {
          subCategory: true,
          event: true,
          variants: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const convertedData = serializeType(data);
      return transformProductList(convertedData);
    }),

  // Search products
  search: baseProcedure
    .input(z.object({ keyword: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.product.findMany({
        where: {
          name: {
            contains: input.keyword,
            mode: "insensitive",
          },
        },
        include: {
          variants: true,
        },
      });

      const convertedData = serializeType(data);
      return convertedData.map((product) => ({
        ...product,
        price: calculateDiscountedPrice(product.regularPrice, product.discount),
      }));
    }),

  // Get product by slug
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.product.findFirst({
        where: { slug: input.slug },
        include: {
          subCategory: true,
          variants: true,
          orderItems: {
            where: {
              order: {
                paymentStatus: {
                  in: ["settlement", "capture"],
                },
              },
            },
          },
        },
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const convertedData = serializeType(data);
      return transformProductWithPrice(convertedData);
    }),

  // Get new arrival products
  getNewArrivals: baseProcedure.query(async () => {
    const data = await prisma.product.findMany({
      select: {
        slug: true,
        images: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: DEFAULT_NEW_ARRIVALS_LIMIT,
    });

    return serializeType(data);
  }),

  // Get product by ID with all subcategories
  getByIdWithSubCategories: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [product, subCategories] = await Promise.all([
        prisma.product.findFirst({
          where: {
            id: input.id,
          },
          include: {
            subCategory: {
              select: {
                id: true,
                name: true,
              },
            },
            variants: true,
          },
        }),
        prisma.subCategory.findMany({
          select: {
            id: true,
            name: true,
          },
        }),
      ]);

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const convertedData = serializeType(product);
      const transformedProduct = transformProductWithPrice(convertedData);

      return {
        ...transformedProduct,
        allSubCategory: subCategories.map(({ id, name }) => ({
          id,
          name,
        })),
      };
    }),

  // Create product
  create: baseProcedure
    .input(productSchema)
    .mutation(async ({ input }) => {
      try {
        const { subCategory, price, hasVariant, variants, ...rest } = input;

        await prisma.product.create({
          data: {
            ...rest,
            subCategoryId: subCategory?.id ?? "",
            regularPrice: hasVariant ? BigInt(0) : price ?? BigInt(0),
            hasVariant,
            variants: hasVariant
              ? {
                  create: variants?.map((variant) => ({
                    name: variant.name,
                    sku: variant.sku,
                    regularPrice: variant.regularPrice,
                    stock: variant.stock,
                    discount: variant.discount,
                    image: variant.image,
                  })),
                }
              : undefined,
          },
        });

        return handleMutationSuccess("Product Created");
      } catch (error) {
        return handleMutationError(error, "Create Product");
      }
    }),

  // Update product
  update: baseProcedure
    .input(productSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id, subCategory, hasVariant, price, variants, ...rest } = input;

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...rest,
            subCategoryId: subCategory?.id ?? "",
            regularPrice: hasVariant ? BigInt(0) : price ?? BigInt(0),
            hasVariant,
          },
        });

        if (hasVariant && variants?.length) {
          await prisma.variant.deleteMany({
            where: { productId: updatedProduct.id },
          });

          await prisma.variant.createMany({
            data: variants.map((v) => ({
              productId: updatedProduct.id,
              image: v.image,
              name: v.name,
              sku: v.sku,
              regularPrice: v.regularPrice,
              stock: v.stock,
              discount: v.discount,
            })),
          });
        }

        return handleMutationSuccess("Product Updated");
      } catch (error) {
        return handleMutationError(error, "Update Product");
      }
    }),

  // Delete product
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.product.delete({
          where: { id: input.id },
        });

        return handleMutationSuccess("Product Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Product");
      }
    }),

  // Delete many products
  deleteMany: baseProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.product.deleteMany({
          where: {
            id: { in: input.ids },
          },
        });

        return handleMutationSuccess("Products Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Products");
      }
    }),
});
