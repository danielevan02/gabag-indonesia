import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { carouselSchema } from "@/lib/schema";

// Carousel schemas
const createCarouselSchema = carouselSchema;

const updateCarouselSchema = carouselSchema.extend({
  id: z.string(),
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

export const carouselRouter = createTRPCRouter({
  // Get all carousels
  getAll: baseProcedure.query(async () => {
    const data = await prisma.carousel.findMany({
      include: {
        desktopImage: {
          select: {
            id: true,
            secure_url: true,
            public_id: true,
            
          },
        },
        mobileImage: {
          select: {
            id: true,
            secure_url: true,
            public_id: true,
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return serializeType(data);
  }),

  // Get active carousels (for frontend)
  getActive: baseProcedure.query(async () => {
    const now = new Date();

    const data = await prisma.carousel.findMany({
      where: {
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: { gte: now } }
            ]
          },
          {
            AND: [
              { startDate: null },
              { endDate: null }
            ]
          },
          {
            AND: [
              { startDate: { lte: now } },
              { endDate: null }
            ]
          },
          {
            AND: [
              { startDate: null },
              { endDate: { gte: now } }
            ]
          }
        ],
      },
      include: {
        desktopImage: {
          select: {
            secure_url: true,
            public_id: true,
          },
        },
        mobileImage: {
          select: {
            secure_url: true,
            public_id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return serializeType(data);
  }),

  // Get carousel by ID
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.carousel.findUnique({
        where: {
          id: input.id,
        },
        include: {
          desktopImage: {
            select: {
              id: true,
              secure_url: true,
              public_id: true,
            },
          },
          mobileImage: {
            select: {
              id: true,
              secure_url: true,
              public_id: true,
            },
          },
        },
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Carousel not found",
        });
      }

      return serializeType(data);
    }),

  // Create carousel
  create: baseProcedure
    .input(createCarouselSchema)
    .mutation(async ({ input }) => {
      try {
        const { name, linkUrl, altText, desktopImageId, mobileImageId, isActive, startDate, endDate } = input;

        await prisma.carousel.create({
          data: {
            name,
            linkUrl,
            altText,
            desktopImageId,
            mobileImageId,
            isActive,
            startDate,
            endDate,
          },
        });

        return handleMutationSuccess("Carousel Created!");
      } catch (error) {
        return handleMutationError(error, "Create Carousel");
      }
    }),

  // Update carousel
  update: baseProcedure
    .input(updateCarouselSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, name, linkUrl, altText, desktopImageId, mobileImageId, isActive, startDate, endDate } = input;

        await prisma.carousel.update({
          where: { id },
          data: {
            name,
            linkUrl,
            altText,
            desktopImageId,
            mobileImageId,
            isActive,
            startDate,
            endDate,
          },
        });

        return handleMutationSuccess("Carousel Updated!");
      } catch (error) {
        return handleMutationError(error, "Update Carousel");
      }
    }),

  // Toggle carousel active status
  toggleActive: baseProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const { id, isActive } = input;

        await prisma.carousel.update({
          where: { id },
          data: { isActive },
        });

        return handleMutationSuccess(
          `Carousel ${isActive ? "activated" : "deactivated"} successfully`
        );
      } catch (error) {
        return handleMutationError(error, "Toggle Carousel Status");
      }
    }),

  // Delete carousel
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.carousel.delete({
          where: {
            id: input.id,
          },
        });

        return handleMutationSuccess("Carousel Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Carousel");
      }
    }),

  // Delete many carousels
  deleteMany: baseProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.carousel.deleteMany({
          where: {
            id: {
              in: input.ids,
            },
          },
        });

        return handleMutationSuccess("Carousels Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Carousels");
      }
    }),
});