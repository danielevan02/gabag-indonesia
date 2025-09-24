import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { productSchema } from "@/lib/schema";
import { TRPCError } from "@trpc/server";

// Constants
const DEFAULT_NEW_ARRIVALS_LIMIT = 2;

// Helper functions
const calculateDiscountedPrice = (regularPrice: number, discount?: number): number => {
  if (!discount) return regularPrice;
  return regularPrice - regularPrice * (discount / 100);
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
  getSelect: baseProcedure.query(async () => {
    const data = await prisma.product.findMany({
      where: {
        subCategoryId: undefined,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return serializeType(data);
  }),
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
          images: {
            take: 1,
            select: {
              mediaFile: {
                select: {
                  secure_url: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const convertedData = serializeType(data);

      return convertedData.map((product) => ({
        ...product,
        images: product.images[0].mediaFile.secure_url,
        price: calculateDiscountedPrice(product.regularPrice, product.discount),
        variants: product.variants.map((variant) => ({
          ...variant,
          price: calculateDiscountedPrice(variant.regularPrice, variant.discount),
        })),
      }));
    }),

  // Search products
  search: baseProcedure.input(z.object({ keyword: z.string() })).query(async ({ input }) => {
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
  getBySlug: baseProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
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
    return {
      ...convertedData,
      variants: convertedData.variants.map((variant) => ({
        ...variant,
        price: calculateDiscountedPrice(variant.regularPrice, variant.discount),
      })),
      price: calculateDiscountedPrice(convertedData.regularPrice, convertedData.discount),
    };
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

  // Get flash sale products
  getFlashSale: baseProcedure.query(async () => {
    const data = await prisma.product.findMany({
      where: {
        eventId: "be32be21-13c2-4ed7-aaa2-861477ebb11f",
      },
      select: {
        regularPrice: true,
        discount: true,
        name: true,
        images: true,
        slug: true,
        hasVariant: true,
        subCategory: {
          select: {
            name: true,
          },
        },
        event: {
          select: {
            name: true,
          },
        },
        variants: {
          select: {
            regularPrice: true,
            discount: true,
          },
        },
      },
    });

    const serializeData = serializeType(data);

    return serializeData.map((product) => ({
      ...product,
      image: product.images[0],
      price: calculateDiscountedPrice(product.regularPrice, product.discount),
      variants: product.variants.map((variant) => ({
        regularPrice: variant.regularPrice,
        price: calculateDiscountedPrice(variant.regularPrice, variant.discount),
      })),
    }));
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
            variants: {
              include: {
                mediaFile: true,
              },
            },
            images: {
              select: {
                mediaFileId: true,
                orderIndex: true,
                isPrimary: true,
              },
            },
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

      return {
        ...convertedData,
        price: calculateDiscountedPrice(convertedData.regularPrice, convertedData.discount),
        variants: convertedData?.variants.map((variant) => ({
          ...variant,
          image: variant.mediaFileId,
          price: calculateDiscountedPrice(variant.regularPrice, variant.discount),
        })),
        images: convertedData.images
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map(img => img.mediaFileId),
        allSubCategory: subCategories.map(({ id, name }) => ({
          id,
          name,
        })),
      };
    }),

  // Create product
  create: baseProcedure
    .input(productSchema.extend({ slug: z.string().min(1, "Slug is required") }))
    .mutation(async ({ input }) => {
      try {
        const { subCategory, price, hasVariant, variants, images, ...rest } = input;
        console.log(input)

        await prisma.product.create({
          data: {
            ...rest,
            sku: input.sku?.trim() || null,
            subCategoryId: subCategory,
            regularPrice: hasVariant ? BigInt(0) : (price ?? BigInt(0)),
            hasVariant,
            variants: hasVariant
              ? {
                  create: variants?.map((variant) => ({
                    name: variant.name,
                    sku: variant.sku,
                    regularPrice: variant.regularPrice,
                    stock: variant.stock,
                    discount: variant.discount,
                    mediaFileId: variant.image,
                  })),
                }
              : undefined,
            images: images && images.length > 0
              ? {
                  create: images.map((imageId, index) => ({
                    mediaFileId: imageId,
                    orderIndex: index,
                    isPrimary: index === 0, // First image is primary
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
        const { id, subCategory, hasVariant, price, variants, images, ...rest } = input;

        // Update product images - delete all existing relations and create new ones with updated order
        if (images !== undefined) {
          await prisma.productMediaRelation.deleteMany({
            where: { productId: id },
          });

          if (images.length > 0) {
            await prisma.productMediaRelation.createMany({
              data: images.map((imageId, index) => ({
                productId: id,
                mediaFileId: imageId,
                orderIndex: index,
                isPrimary: index === 0, // First image in array is primary
              })),
            });
          }
        }

        const updatedProduct = await prisma.product.update({
          where: { id },
          data: {
            ...rest,
            subCategoryId: subCategory ?? "",
            regularPrice: hasVariant ? BigInt(0) : (price ?? BigInt(0)),
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
              mediaFileId: v.image,
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
  delete: baseProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
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
