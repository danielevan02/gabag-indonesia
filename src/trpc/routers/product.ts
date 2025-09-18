import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serializeType } from "@/lib/utils";
import { productSchema } from "@/lib/schema";

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
      const { subCategory, search, subCategoriesId, price } = input;

      const data = await prisma.product.findMany({
        where: {
          AND: [
            subCategory
              ? {
                  subCategory: {
                    name: {
                      contains: subCategory,
                      mode: "insensitive",
                    },
                  },
                }
              : {},
            search && search.length !== 0
              ? { name: { contains: search, mode: "insensitive" } }
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
        },
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

      return convertedData.map((product) => {
        // IF THERE IS DISCOUNT THEN USE IT, IF NO THEN IT WILL BE REGULAR PRICE
        const productPrice = product.discount
          ? product.regularPrice - product.regularPrice * (product.discount / 100)
          : product.regularPrice;

        return {
          ...product,
          price: productPrice,
          image: product.images[0],
          variants: product.variants.map((variant) => {
            const variantPrice = variant.discount
              ? variant.regularPrice - variant.regularPrice * (variant.discount / 100)
              : variant.regularPrice;
            return {
              ...variant,
              price: variantPrice,
            };
          }),
        };
      });
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
    });

    const convertedData = serializeType(data);

    return convertedData.map((product) => {
      const productPrice = product.discount
        ? product.regularPrice - product.regularPrice * (product.discount / 100)
        : product.regularPrice;
      return {
        ...product,
        price: productPrice,
      };
    });
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
      throw new Error("Product not found");
    }

    const convertedData = serializeType(data);

    const productPrice = convertedData.discount
      ? convertedData.regularPrice - convertedData.regularPrice * (convertedData.discount / 100)
      : convertedData.regularPrice;

    return {
      ...convertedData,
      variants: convertedData.variants.map((variant) => ({
        ...variant,
        price: variant.regularPrice - variant.regularPrice * ((variant.discount ?? 0) / 100),
      })),
      price: productPrice,
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
      take: 2,
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

      const convertedData = serializeType(product);

      if(!convertedData) return console.log("THERE IS NO CONVERTED DATA, FROM GET BY ID WITH SUBCATEGORIES")

      const productPrice = convertedData.discount
        ? convertedData.regularPrice - convertedData.regularPrice * (convertedData.discount / 100)
        : convertedData.regularPrice;

      return {
        ...convertedData,
        price: productPrice,
        allSubCategory: subCategories.map(({ id, name }) => ({
          id,
          name,
        })),
        variants: convertedData?.variants.map((variant) => {
          const variantPrice = variant.discount ? variant.regularPrice - variant.regularPrice * (variant.discount / 100) : variant.regularPrice
          return {
            ...variant,
            price: variantPrice,
          }
        }),
      };
    }),

  // Create product
  create: baseProcedure.input(productSchema).mutation(async ({ input }) => {
    try {
      const { subCategory, price, hasVariant, variants, ...rest } =
        input;

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

      revalidatePath("/admin/catalog/product");

      return {
        success: true,
        message: "Product Created",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to Create Product",
      };
    }
  }),

  // Update product
  update: baseProcedure
    .input(productSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const {id, subCategory, hasVariant, price, variants, ...rest} = input;

        const updatedProduct = await prisma.product.update({
          where: {
            id,
          },
          data: {
            ...rest,
            subCategoryId: subCategory?.id ?? "",
            regularPrice: hasVariant ? BigInt(0) : price ?? BigInt(0),
            hasVariant,
          },
        });

        if (hasVariant && variants?.length !== 0) {
          await prisma.variant.deleteMany({
            where: {
              productId: updatedProduct.id,
            },
          });

          await prisma.variant.createMany({
            data: variants!.map((v) => ({
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

        revalidatePath("/admin/catalog/product");

        return {
          success: true,
          message: "Product Updated",
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          message: "Failed to Update Product",
        };
      }
    }),

  // Delete product
  delete: baseProcedure.input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    try {
      await prisma.product.delete({
        where: {
          id: input.id,
        },
      });

      revalidatePath("/admin/catalog/product");

      return {
        success: true,
        message: "Product Deleted",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to Delete Product",
      };
    }
  }),

  // Delete many products
  deleteMany: baseProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.product.deleteMany({
          where: {
            id: {
              in: input.ids,
            },
          },
        });

        revalidatePath("/admin/catalog/product");

        return {
          success: true,
          message: "Products Deleted",
        };
      } catch (error) {
        console.log(error);
        return {
          success: false,
          message: "Failed to Delete Products",
        };
      }
    }),
});
