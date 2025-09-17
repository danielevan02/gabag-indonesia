"use server";

import prisma from "../db/prisma";
import { ProductFormType } from "@/app/admin/catalog/product/add/components/product-form";
import { revalidatePath } from "next/cache";
import { serializeType } from "../utils";
import { getAllSubCategories } from "./subCategory.action";

export async function getAllProducts(
  subCategory?: string,
  search?: string,
  subCategoriesId?: string[],
  sort?: string,
  price?: { min?: string; max?: string }
) {
  const data = await prisma.product.findMany({
    where: {
      AND: [
        // Filter berdasarkan kategori (cari produk yang memiliki kategori dengan nama tertentu)
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
        // Filter berdasarkan nama produk
        search && search.length !== 0 ? { name: { contains: search, mode: "insensitive" } } : {},
        // Filter berdasarkan kategori ID (produk yang memiliki kategori dalam array ini)
        subCategoriesId?.length
          ? {
              subCategoryId: {
                in: subCategoriesId,
              },
            }
          : {},
        // Filter berdasarkan harga (min dan max)
        price?.min || price?.max
          ? {
              price: {
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

    orderBy: sort
      ? {
          createdAt: "desc",
        }
      : {
          createdAt: "desc",
        },
  });

  const convertedData = serializeType(data);

  return convertedData.map((product) => ({
    ...product,
    price: product.regularPrice - product.regularPrice * (product.discount / 100),
    image: product.images[0],
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.regularPrice - variant.regularPrice * ((variant.discount ?? 0) / 100),
    })),
  }));
}

export async function searchProduct(keyword: string) {
  const data = await prisma.product.findMany({
    where: {
      name: {
        contains: keyword,
        mode: "insensitive",
      },
    },
  });

  const convertedData = serializeType(data)

  return convertedData.map((product) => ({
    ...product,
    price: product.regularPrice - product.regularPrice*(product.discount/100)
  }))
}

export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findFirst({
    where: { slug },
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

  return {
    ...convertedData,
    variants: convertedData.variants.map((variant) => ({
      ...variant,
      price: variant.regularPrice - variant.regularPrice*((variant.discount??0)/100)
    })),
    price: convertedData.regularPrice - convertedData.regularPrice*(convertedData.discount/100)
  }
}

export async function getNewArrivalProduct() {
  const data = await prisma.product.findMany({
    select: {
      slug: true,
      images: true,
      name: true
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 2,
  });

  const convertedData = serializeType(data)

  return convertedData
}

export async function getProductByIdAndAllSubCategory(id: string) {
  const [product, subCategories] = await Promise.all([
    await prisma.product.findFirst({
      where: {
        id,
      },
      include: {
        subCategory: {
          select: {
            id: true,
            name: true
          }
        },
        variants: true,
      },
    }),
    await getAllSubCategories()
  ])

  const convertedData = serializeType(product);

  let productPrice;
  if(convertedData?.regularPrice) {
    productPrice = convertedData.regularPrice - convertedData.regularPrice*(convertedData.discount/100)
  }

  return {
    ...convertedData,
    price: productPrice,
    allSubCategory: subCategories.map(({id, name}) => ({
      id,
      name
    })),
    variants: convertedData?.variants.map((variant) => ({
      ...variant,
      price: variant.regularPrice - variant.regularPrice*((variant.discount??0)/100)
    })),
  }
}

export async function createProduct(data: ProductFormType) {
  try {
    const { subCategory, name, price, image, description, slug, hasVariant, variants, ...rest } =
      data;

    await prisma.product.create({
      data: {
        ...rest,
        name: name!,
        slug: slug!,
        subCategoryId: subCategory?.id ?? "",
        regularPrice: hasVariant ? 0 : price,
        images: image,
        description: description!,
        hasVariant,
        variants: hasVariant
          ? {
              create: variants?.map((variant) => ({
                name: variant.name,
                sku: variant.sku,
                regularPrice: variant.regularPrice,
                stock: variant.stock,
                discount: variant.discount,
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
}

export async function updateProduct(data: ProductFormType & { id?: string }) {
  try {
    const {
      subCategory,
      name,
      price,
      discount,
      image,
      description,
      id,
      hasVariant,
      variants,
      stock,
      weight,
      height,
      length,
      width,
    } = data;

    if (!id) {
      throw new Error("Product ID is required");
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: name!,
        subCategoryId: subCategory?.id ?? "",
        regularPrice: hasVariant ? 0 : price,
        discount,
        images: image,
        description: description!,
        hasVariant,
        height,
        width,
        length,
        weight,
        stock,
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
          productId: updatedProduct.id, // penting! relasi ke product
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
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: {
        id,
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
}

export async function deleteManyProducts(ids: string[]) {
  try {
    await prisma.product.deleteMany({
      where: {
        id: {
          in: ids,
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
}
