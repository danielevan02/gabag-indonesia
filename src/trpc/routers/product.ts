import { z } from "zod";
import { baseProcedure, adminProcedure, createTRPCRouter } from "../init";
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
  getAllSlug: baseProcedure.query(async () => {
    return await prisma.product.findMany({
      select: {
        slug: true
      }
    })
  }),
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
        limit: z.number().optional(),
        page: z.number().default(1),
        price: z
          .object({
            min: z.string().optional(),
            max: z.string().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ input }) => {
      const now = new Date();
      const limit = input.limit || 12;
      const skip = ((input.page || 1) - 1) * limit;
      const where = buildProductFilters(input);

      const [data, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          select: {
            id: true,
            regularPrice: true,
            discount: true,
            name: true,
            slug: true,
            hasVariant: true,
            stock: true,
            images: {
              take: 1,
              select: {
                mediaFile: {
                  select: {
                    secure_url: true,
                  },
                },
              },
            },
            subCategory: {
              select: {
                name: true,
              },
            },
            variants: true,
            campaignItems: {
              where: {
                campaign: {
                  startDate: { lte: now },
                  OR: [
                    { endDate: { gte: now } },
                    { endDate: null as any },
                  ],
                },
              },
              include: {
                campaign: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    discountType: true,
                    defaultDiscount: true,
                    priority: true,
                  },
                },
                variant: {
                  select: {
                    id: true,
                  },
                },
              },
              orderBy: {
                campaign: {
                  priority: 'desc',
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.product.count({ where })
      ]);

      const convertedData = serializeType(data);

      return {
        products: convertedData.map((product) => {
          // Check if product (not variant-specific) is in campaign
          const productCampaignItem = product.campaignItems.find((item) => !item.variantId);

          // If no product-level campaign, check if any variant is in campaign
          const variantCampaignItem = !productCampaignItem ? product.campaignItems.find((item) => item.variantId) : null;

          // Use product campaign if exists, otherwise use variant campaign for display
          const campaignItemForDisplay = productCampaignItem || variantCampaignItem;

          const campaignDiscount = campaignItemForDisplay
            ? (campaignItemForDisplay.customDiscount || campaignItemForDisplay.campaign.defaultDiscount)
            : 0;
          const campaignDiscountType = campaignItemForDisplay
            ? (campaignItemForDisplay.customDiscountType || campaignItemForDisplay.campaign.discountType)
            : "PERCENT";

          // If campaign discount is 0, use product's own discount for display
          const displayDiscount = campaignDiscount > 0 ? campaignDiscount : (product.discount || 0);
          const displayDiscountType = campaignDiscount > 0 ? campaignDiscountType : "PERCENT";

          const productCampaign = campaignItemForDisplay ? {
            name: campaignItemForDisplay.campaign.name,
            type: campaignItemForDisplay.campaign.type,
            discount: displayDiscount,
            discountType: displayDiscountType,
          } : null;

          // Calculate product price (with campaign if applicable)
          // Only apply campaign discount to product price if it's a product-level campaign (not variant-specific)
          let productPrice = calculateDiscountedPrice(product.regularPrice, product.discount);
          if (productCampaignItem && campaignDiscount > 0) {
            // Only apply campaign discount if it's greater than 0
            if (campaignDiscountType === "PERCENT") {
              productPrice = product.regularPrice - (product.regularPrice * (campaignDiscount / 100));
            } else {
              productPrice = product.regularPrice - campaignDiscount;
            }
          }
          // If campaign discount is 0, productPrice stays as product's own discounted price

          // Map variants with campaign info
          const variantsWithCampaign = product.variants.map((variant: any) => {
            // Find if this variant is in campaign
            const variantCampaignItem = product.campaignItems.find((item: any) => item.variantId === variant.id);

            let price = calculateDiscountedPrice(variant.regularPrice, variant.discount);

            if (variantCampaignItem) {
              // Apply campaign discount
              const campaignDiscount = variantCampaignItem.customDiscount || variantCampaignItem.campaign.defaultDiscount;
              const campaignDiscountType = variantCampaignItem.customDiscountType || variantCampaignItem.campaign.discountType;

              // Only apply campaign discount if it's greater than 0
              if (campaignDiscount > 0) {
                if (campaignDiscountType === "PERCENT") {
                  price = variant.regularPrice - (variant.regularPrice * (campaignDiscount / 100));
                } else {
                  price = variant.regularPrice - campaignDiscount;
                }
              }
              // If campaign discount is 0, price stays as variant's own discounted price
            }

            return {
              ...variant,
              price,
            };
          });

          return {
            ...product,
            images: product.images[0].mediaFile.secure_url,
            price: productPrice,
            variants: variantsWithCampaign,
            campaign: productCampaign,
          };
        }),
        totalCount,
        currentPage: input.page || 1,
        totalPages: Math.ceil(totalCount / limit)
      };
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
        images: {
          take: 1,
          select: {
            mediaFile: {
              select: {
                secure_url: true
              }
            }
          }
        }, 
        variants: {
          select: {
            regularPrice: true,
            discount: true
          }
        }
      }
    });

    const convertedData = serializeType(data);
    return convertedData.map((product) => {
      let price: number;

      if(product.variants.length !== 0){
        // If product has variants, get the cheapest variant price
        const variantPrices = product.variants.map(variant =>
          calculateDiscountedPrice(variant.regularPrice, variant.discount)
        );
        price = Math.min(...variantPrices);
      } else {
        // If no variants, use product price
        price = calculateDiscountedPrice(product.regularPrice, product.discount);
      }

      return {
        ...product,
        images: product.images[0].mediaFile.secure_url,
        price,
      }
    });
  }),

  // Get product by slug
  getBySlug: baseProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const now = new Date();

    const data = await prisma.product.findFirst({
      where: { slug: input.slug },
      include: {
        images: {
          include: {
            mediaFile: {
              select: {
                secure_url: true
              }
            }
          }
        },
        subCategory: true,
        variants: {
          include: {
            mediaFile: {
              select: {
                secure_url: true
              }
            }
          }
        },
        orderItems: {
          where: {
            order: {
              paymentStatus: {
                in: ["settlement", "capture"],
              },
            },
          },
        },
        campaignItems: {
          where: {
            campaign: {
              startDate: { lte: now },
              OR: [
                { endDate: { gte: now } },
                { endDate: null as any },
              ],
            },
          },
          include: {
            campaign: {
              select: {
                id: true,
                name: true,
                type: true,
                discountType: true,
                defaultDiscount: true,
                priority: true,
              },
            },
            variant: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            campaign: {
              priority: 'desc',
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

    // Check if product (not variant-specific) is in campaign
    const productCampaignItem = convertedData.campaignItems.find((item: any) => !item.variantId);

    // If no product-level campaign, check if any variant is in campaign
    const variantCampaignItem = !productCampaignItem ? convertedData.campaignItems.find((item: any) => item.variantId) : null;

    // Use product campaign if exists, otherwise use variant campaign for display
    const campaignItemForDisplay = productCampaignItem || variantCampaignItem;

    let productCampaign = campaignItemForDisplay ? {
      name: campaignItemForDisplay.campaign.name,
      type: campaignItemForDisplay.campaign.type,
      discount: campaignItemForDisplay.customDiscount || campaignItemForDisplay.campaign.defaultDiscount,
      discountType: campaignItemForDisplay.customDiscountType || campaignItemForDisplay.campaign.discountType,
    } : null;

    // Map variants with campaign info
    const variantsWithCampaign = convertedData.variants.map((variant: any) => {
      // Find if this variant is in campaign
      const variantCampaignItem = convertedData.campaignItems.find((item: any) => item.variantId === variant.id);

      let price = calculateDiscountedPrice(variant.regularPrice, variant.discount);
      let campaign = null;

      if (variantCampaignItem) {
        // Apply campaign discount
        const campaignDiscount = variantCampaignItem.customDiscount || variantCampaignItem.campaign.defaultDiscount;
        const campaignDiscountType = variantCampaignItem.customDiscountType || variantCampaignItem.campaign.discountType;

        // Only apply campaign discount if it's greater than 0
        // Otherwise, use variant's own discount
        if (campaignDiscount > 0) {
          if (campaignDiscountType === "PERCENT") {
            price = variant.regularPrice - (variant.regularPrice * (campaignDiscount / 100));
          } else {
            price = variant.regularPrice - campaignDiscount;
          }

          campaign = {
            name: variantCampaignItem.campaign.name,
            type: variantCampaignItem.campaign.type,
            discount: campaignDiscount,
            discountType: campaignDiscountType,
          };
        } else {
          // Campaign discount is 0, show variant's own discount in campaign badge
          campaign = {
            name: variantCampaignItem.campaign.name,
            type: variantCampaignItem.campaign.type,
            discount: variant.discount || 0,
            discountType: "PERCENT" as const,
          };
        }
      }

      return {
        ...variant,
        price,
        campaign,
      };
    });

    // Calculate product price (with campaign if applicable)
    // Only apply campaign discount to product price if it's a product-level campaign (not variant-specific)
    let productPrice = calculateDiscountedPrice(convertedData.regularPrice, convertedData.discount);
    if (productCampaignItem) {
      if (productCampaign!.discount > 0) {
        // Apply campaign discount
        if (productCampaign!.discountType === "PERCENT") {
          productPrice = convertedData.regularPrice - (convertedData.regularPrice * (productCampaign!.discount / 100));
        } else {
          productPrice = convertedData.regularPrice - productCampaign!.discount;
        }
      } else {
        // Campaign discount is 0, update productCampaign to show product's own discount
        productCampaign = {
          name: productCampaign!.name,
          type: productCampaign!.type,
          discount: convertedData.discount || 0,
          discountType: "PERCENT" as const,
        };
      }
    }

    return {
      ...convertedData,
      images: convertedData.images.map((image: any) => image.mediaFile.secure_url),
      variants: variantsWithCampaign,
      price: productPrice,
      campaign: productCampaign,
    };
  }),

  // Get new arrival products
  getNewArrivals: baseProcedure.query(async () => {
    const data = await prisma.product.findMany({
      select: {
        slug: true,
        images: {
          take: 1,
          select: {
            mediaFile: {
              select: {
                secure_url: true
              }
            }
          }
        },
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: DEFAULT_NEW_ARRIVALS_LIMIT,
    });

    const convertedData = serializeType(data)

    return convertedData.map((product) => ({
      slug: product.slug,
      name: product.name,
      image: product.images[0].mediaFile.secure_url
    }));
  }),

  // Get product by ID with all subcategories (Admin only)
  getByIdWithSubCategories: adminProcedure
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
          .map((img) => img.mediaFileId),
        allSubCategory: subCategories.map(({ id, name }) => ({
          id,
          name,
        })),
      };
    }),

  // Create product (Admin only)
  create: adminProcedure
    .input(productSchema.extend({ slug: z.string().min(1, "Slug is required") }))
    .mutation(async ({ input }) => {
      try {
        const { subCategory, price, hasVariant, variants, images, ...rest } = input;

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
                    discount: variant.discount ?? input.discount,
                    mediaFileId: variant.image,
                  })),
                }
              : undefined,
            images:
              images && images.length > 0
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

  // Update product (Admin only)
  update: adminProcedure
    .input(productSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id, subCategory, hasVariant, price, variants, images, sku, ...rest } = input;

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
            sku: sku?.trim() || null,
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
              discount: v.discount ?? input.discount,
            })),
          });
        }

        return handleMutationSuccess("Product Updated");
      } catch (error) {
        return handleMutationError(error, "Update Product");
      }
    }),

  // Delete product (Admin only)
  delete: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      await prisma.product.delete({
        where: { id: input.id },
      });

      return handleMutationSuccess("Product Deleted");
    } catch (error) {
      return handleMutationError(error, "Delete Product");
    }
  }),

  // Delete many products (Admin only)
  deleteMany: adminProcedure
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
