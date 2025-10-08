import prisma from "@/lib/prisma";
import { adminProcedure, baseProcedure, createTRPCRouter } from "../init";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import z from "zod";

// Type for products returned in getDisplay (matches ProductCard props)
type CampaignDisplayProduct = {
  name: string;
  price: number;
  regularPrice: number;
  discount?: number;
  images: string;
  slug: string;
  hasVariant: boolean;
  subCategory: {
    name: string;
  };
  campaign: {
    name: string;
    type: string;
    discount: number;
    discountType: "PERCENT" | "FIXED";
  };
  variants?: {
    price: number;
    regularPrice: number;
  }[];
};

const campaignInputSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  type: z.enum([
    "FLASH_SALE",
    "DAILY_DEALS",
    "PAYDAY_SALE",
    "SEASONAL",
    "CLEARANCE",
    "NEW_ARRIVAL"
  ]),
  discountType: z.enum(["PERCENT", "FIXED"]),
  defaultDiscount: z.coerce.number().min(0, "Discount must be positive"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(), // Optional: for permanent campaigns
  totalStockLimit: z.coerce.number().optional(),
  priority: z.coerce.number().default(0),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(), // NULL = whole product, NOT NULL = specific variant
    customDiscount: z.coerce.number().optional(),
    customDiscountType: z.enum(["PERCENT", "FIXED"]).optional(),
    stockLimit: z.coerce.number().optional(),
  })).min(1, "At least one item is required"),
}).refine((data) => {
  // Only validate if endDate is provided
  if (data.endDate) {
    return data.endDate > data.startDate;
  }
  return true; // Valid if no endDate (permanent campaign)
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.discountType === "PERCENT") {
    return data.defaultDiscount <= 100;
  }
  return true;
}, {
  message: "Percentage discount must be between 0-100",
  path: ["defaultDiscount"],
});

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

export const campaignRouter = createTRPCRouter({
  getDisplay: baseProcedure.query(async () => {
    const now = new Date()
    const data = await prisma.campaign.findFirst({
      where: {
        // Real-time check based on dates (not isActive field)
        // isActive is just a manual toggle by admin
        startDate: { lte: now },
        OR: [
          { endDate: { gte: now } }, // Temporary campaign
          { endDate: null as any }, // Permanent campaign
        ],
      },
      orderBy: [
        { priority: 'desc' }, // Highest priority first
        { createdAt: 'desc' }, // Most recent if same priority
      ],
      include: {
        items: {
          include: {
            product: {
              include: {
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
                variants: {
                  select: {
                    id: true,
                    regularPrice: true,
                    discount: true,
                  },
                },
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!data) {
      return {
        campaign: null,
        products: [] as CampaignDisplayProduct[]
      }
    }

    const convertedData = serializeType(data)

    // Extract unique products using Map
    // Logic:
    // - Items with variantId → take parent product
    // - Items without variantId → take product directly
    // - Deduplicate by productId
    const productMap = new Map<string, CampaignDisplayProduct>();

    // First pass: collect which variants are in campaign
    const variantInCampaignMap = new Map<string, { discount: number; discountType: string }>();
    convertedData.items.forEach((item: any) => {
      if (item.variantId) {
        const campaignDiscount = item.customDiscount ?? data.defaultDiscount;
        const campaignDiscountType = item.customDiscountType ?? data.discountType;
        variantInCampaignMap.set(item.variantId, {
          discount: campaignDiscount,
          discountType: campaignDiscountType,
        });
      }
    });

    // Second pass: build product list with campaign-adjusted variant prices
    convertedData.items.forEach((item: any) => {
      const productId = item.product.id;

      // Skip if already added (deduplicate)
      if (productMap.has(productId)) return;

      const product = item.product;

      // Check if this is a whole-product campaign (item has no variantId)
      const isWholeProductCampaign = !item.variantId;

      // Calculate campaign discount for this item (product level)
      const campaignDiscount = item.customDiscount ?? data.defaultDiscount;
      const campaignDiscountType = item.customDiscountType ?? data.discountType;

      // Calculate variant prices (including campaign discount if variant is in campaign)
      const variantsWithCampaignPrice = product.variants?.map((v: any) => {
        // Check if this variant is in campaign
        const variantCampaign = variantInCampaignMap.get(v.id);
        let finalPrice: number;

        if (variantCampaign) {
          // This variant has campaign discount - use campaign discount
          if (variantCampaign.discountType === "PERCENT") {
            finalPrice = v.regularPrice - (v.regularPrice * (variantCampaign.discount / 100));
          } else {
            finalPrice = v.regularPrice - variantCampaign.discount;
          }
        } else if (isWholeProductCampaign) {
          // Whole product is in campaign - apply campaign discount to all variants
          if (campaignDiscountType === "PERCENT") {
            finalPrice = v.regularPrice - (v.regularPrice * (campaignDiscount / 100));
          } else {
            finalPrice = v.regularPrice - campaignDiscount;
          }
        } else {
          // This variant is NOT in campaign and product is not in campaign - use variant's own discount or regular price
          finalPrice = v.regularPrice - (v.regularPrice * ((v.discount || 0) / 100));
        }

        return {
          price: finalPrice,
          regularPrice: v.regularPrice,
        };
      }) || [];

      // Calculate final price for display
      let displayPrice: number;
      if (product.hasVariant && variantsWithCampaignPrice.length > 0) {
        // For products with variants, use the lowest variant price
        displayPrice = Math.min(...variantsWithCampaignPrice.map((v: { price: number; regularPrice: number }) => v.price));
      } else {
        // For products without variants, calculate from product price with campaign discount
        if (campaignDiscountType === "PERCENT") {
          displayPrice = product.regularPrice - (product.regularPrice * (campaignDiscount / 100));
        } else {
          displayPrice = product.regularPrice - campaignDiscount;
        }
      }

      productMap.set(productId, {
        name: product.name,
        slug: product.slug,
        regularPrice: product.regularPrice,
        discount: product.discount ?? null,
        hasVariant: product.hasVariant,
        images: product.images[0]?.mediaFile.secure_url || "",
        subCategory: product.subCategory,
        campaign: {
          name: data.name,
          type: data.type,
          discount: campaignDiscount,
          discountType: campaignDiscountType,
        },
        variants: variantsWithCampaignPrice,
        price: displayPrice,
      });
    });

    return {
      campaign: {
        id: convertedData.id,
        name: convertedData.name,
        type: convertedData.type,
        endDate: convertedData.endDate ? new Date(convertedData.endDate).toISOString() : null,
      },
      products: Array.from(productMap.values())
    }
  }),
  // Get all campaigns
  getAll: adminProcedure.query(async () => {
    const data = await prisma.campaign.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                hasVariant: true,
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return serializeType(data);
  }),

  // Get active campaigns (for public)
  getActive: baseProcedure.query(async () => {
    const now = new Date();
    const data = await prisma.campaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                regularPrice: true,
                hasVariant: true,
              }
            },
            variant: {
              select: {
                id: true,
                name: true,
                regularPrice: true,
              }
            }
          }
        }
      },
      orderBy: { priority: "desc" },
    });

    return serializeType(data);
  }),

  // Get campaign by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.campaign.findUnique({
        where: { id: input.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  regularPrice: true,
                  stock: true,
                  hasVariant: true,
                }
              },
              variant: {
                select: {
                  id: true,
                  name: true,
                  regularPrice: true,
                  stock: true,
                }
              }
            }
          }
        },
      });

      return serializeType(data);
    }),

  // Create campaign
  create: adminProcedure
    .input(campaignInputSchema)
    .mutation(async ({ input }) => {
      try {
        const {
          name,
          description,
          type,
          discountType,
          defaultDiscount,
          startDate,
          endDate,
          totalStockLimit,
          priority,
          items,
        } = input;

        // Always set isActive to true - let the query filter by dates
        // This allows scheduled campaigns to auto-activate when their time comes
        const isActive = true;

        // Prepare data object
        const campaignData: any = {
          name,
          description,
          type,
          discountType,
          defaultDiscount,
          startDate,
          totalStockLimit,
          priority,
          isActive,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId || null,
              customDiscount: item.customDiscount,
              customDiscountType: item.customDiscountType,
              stockLimit: item.stockLimit,
            })),
          },
        };

        // Only add endDate if it exists
        if (endDate) {
          campaignData.endDate = endDate;
        }

        const campaign = await prisma.campaign.create({
          data: campaignData,
          include: {
            items: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        });

        return {
          success: true,
          message: "Campaign created successfully",
          campaign: serializeType(campaign),
        };
      } catch (error) {
        return handleMutationError(error, "create campaign");
      }
    }),

  // Update campaign
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string().min(1, "Campaign name is required").optional(),
          description: z.string().optional(),
          type: z.enum([
            "FLASH_SALE",
            "DAILY_DEALS",
            "PAYDAY_SALE",
            "SEASONAL",
            "CLEARANCE",
            "NEW_ARRIVAL"
          ]).optional(),
          discountType: z.enum(["PERCENT", "FIXED"]).optional(),
          defaultDiscount: z.coerce.number().min(0, "Discount must be positive").optional(),
          startDate: z.coerce.date().optional(),
          endDate: z.coerce.date().optional(),
          totalStockLimit: z.coerce.number().optional(),
          priority: z.coerce.number().optional(),
          items: z.array(z.object({
            productId: z.string(),
            variantId: z.string().optional(),
            customDiscount: z.coerce.number().optional(),
            customDiscountType: z.enum(["PERCENT", "FIXED"]).optional(),
            stockLimit: z.coerce.number().optional(),
          })).optional(),
        }).refine((data) => {
          // Validate endDate is after startDate if both are provided
          if (data.startDate && data.endDate) {
            return data.endDate > data.startDate;
          }
          return true;
        }, {
          message: "End date must be after start date",
          path: ["endDate"],
        }).refine((data) => {
          // Validate percentage discount is <= 100
          if (data.discountType === "PERCENT" && data.defaultDiscount !== undefined) {
            return data.defaultDiscount <= 100;
          }
          return true;
        }, {
          message: "Percentage discount must be between 0-100",
          path: ["defaultDiscount"],
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, data } = input;

        const {
          name,
          description,
          type,
          discountType,
          defaultDiscount,
          startDate,
          endDate,
          totalStockLimit,
          priority,
          items,
        } = data;

        // Fetch existing campaign to get current values
        const existing = await prisma.campaign.findUnique({ where: { id } });
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Campaign not found",
          });
        }

        // Prepare update data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (discountType !== undefined) updateData.discountType = discountType;
        if (defaultDiscount !== undefined) updateData.defaultDiscount = defaultDiscount;
        if (startDate !== undefined) updateData.startDate = startDate;
        if (endDate !== undefined) updateData.endDate = endDate;
        if (totalStockLimit !== undefined) updateData.totalStockLimit = totalStockLimit;
        if (priority !== undefined) updateData.priority = priority;

        // Keep isActive as true - let the query filter by dates
        // This allows scheduled campaigns to auto-activate
        // If dates are updated, ensure isActive remains true (unless manually toggled)
        if (startDate !== undefined || endDate !== undefined) {
          // Only update isActive if it's currently false (manual toggle)
          // Otherwise keep it true to allow scheduled activation
          if (existing.isActive === false) {
            // Respect manual toggle - don't auto-enable
          } else {
            updateData.isActive = true;
          }
        }

        // Update campaign
        const campaign = await prisma.$transaction(async (tx) => {
          // Update campaign basic info
          await tx.campaign.update({
            where: { id },
            data: updateData,
          });

          // Smart update items if provided
          if (items && items.length > 0) {
            // Fetch existing campaign items
            const existingItems = await tx.campaignItem.findMany({
              where: { campaignId: id },
            });

            // Create a map for easy lookup: key = "productId:variantId"
            const existingItemsMap = new Map(
              existingItems.map((item) => [
                `${item.productId}:${item.variantId || "null"}`,
                item,
              ])
            );

            const newItemsMap = new Map(
              items.map((item) => [
                `${item.productId}:${item.variantId || "null"}`,
                item,
              ])
            );

            // 1. UPDATE existing items that are still in the new list
            for (const [key, newItem] of newItemsMap.entries()) {
              const existingItem = existingItemsMap.get(key);

              if (existingItem) {
                // Item exists - update it (preserve soldCount)
                await tx.campaignItem.update({
                  where: { id: existingItem.id },
                  data: {
                    customDiscount: newItem.customDiscount,
                    customDiscountType: newItem.customDiscountType,
                    stockLimit: newItem.stockLimit,
                    // soldCount is NOT updated - preserved from existing
                  },
                });
              }
            }

            // 2. CREATE new items that don't exist yet
            const itemsToCreate = items.filter((item) => {
              const key = `${item.productId}:${item.variantId || "null"}`;
              return !existingItemsMap.has(key);
            });

            if (itemsToCreate.length > 0) {
              await tx.campaignItem.createMany({
                data: itemsToCreate.map((item) => ({
                  campaignId: id,
                  productId: item.productId,
                  variantId: item.variantId || null,
                  customDiscount: item.customDiscount,
                  customDiscountType: item.customDiscountType,
                  stockLimit: item.stockLimit,
                  soldCount: 0, // Start with 0 for new items
                })),
              });
            }

            // 3. DELETE items that are no longer in the new list
            const itemsToDelete = existingItems.filter((existingItem) => {
              const key = `${existingItem.productId}:${existingItem.variantId || "null"}`;
              return !newItemsMap.has(key);
            });

            if (itemsToDelete.length > 0) {
              await tx.campaignItem.deleteMany({
                where: {
                  id: { in: itemsToDelete.map((item) => item.id) },
                },
              });
            }
          }

          return tx.campaign.findUnique({
            where: { id },
            include: {
              items: {
                include: {
                  product: true,
                  variant: true
                }
              }
            }
          });
        });

        return {
          success: true,
          message: "Campaign updated successfully",
          campaign: serializeType(campaign),
        };
      } catch (error) {
        return handleMutationError(error, "update campaign");
      }
    }),

  // Delete campaign
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.campaign.delete({
          where: { id: input.id },
        });

        return handleMutationSuccess("Campaign deleted successfully");
      } catch (error) {
        return handleMutationError(error, "delete campaign");
      }
    }),

  // Toggle campaign active status
  toggleActive: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await prisma.campaign.update({
          where: { id: input.id },
          data: { isActive: input.isActive },
        });

        return handleMutationSuccess(
          input.isActive ? "Campaign activated" : "Campaign deactivated"
        );
      } catch (error) {
        return handleMutationError(error, "toggle campaign status");
      }
    }),

  // Increment sold count for item in campaign
  incrementSoldCount: baseProcedure
    .input(
      z.object({
        campaignId: z.string(),
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await prisma.$transaction(async (tx) => {
          // Update campaign item sold count
          await tx.campaignItem.updateMany({
            where: {
              campaignId: input.campaignId,
              productId: input.productId,
              variantId: input.variantId || null,
            },
            data: {
              soldCount: {
                increment: input.quantity,
              },
            },
          });

          // Update campaign total sold count
          await tx.campaign.update({
            where: { id: input.campaignId },
            data: {
              totalSoldCount: {
                increment: input.quantity,
              },
            },
          });
        });

        return handleMutationSuccess("Sold count updated");
      } catch (error) {
        return handleMutationError(error, "update sold count");
      }
    }),
});
