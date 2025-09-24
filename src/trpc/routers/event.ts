import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { TRPCError } from "@trpc/server";
import { eventSchema } from "@/lib/schema";

// Event schemas
const createEventSchema = eventSchema;

const updateEventSchema = eventSchema.extend({
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

export const eventRouter = createTRPCRouter({
  getProductForEvents: baseProcedure.query(async () => {
    return await prisma.product.findMany({
      select: {
        id: true,
        name: true
      }
    })
  }),
  // Get all events
  getAll: baseProcedure.query(async () => {
    const data = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return serializeType(data);
  }),

  // Get event by ID
  getById: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const data = await prisma.event.findUnique({
        where: {
          id: input.id,
        },
        include: {
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
          message: "Event not found",
        });
      }

      return serializeType(data);
    }),

  // Get active events
  getActive: baseProcedure.query(async () => {
    const data = await prisma.event.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: { gte: new Date() } },
          { endDate: null },
        ],
      },
      include: {
        products: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return serializeType(data);
  }),

  // Create event
  create: baseProcedure
    .input(createEventSchema)
    .mutation(async ({ input }) => {
      try {
        const { discount, name, products } = input;

        await prisma.event.create({
          data: {
            name,
            discount,
            products: {
              connect: products?.map((productId) => ({ id: productId })) || [],
            },
          },
        });

        return handleMutationSuccess("Event Created!");
      } catch (error) {
        return handleMutationError(error, "Create Event");
      }
    }),

  // Update event
  update: baseProcedure
    .input(updateEventSchema)
    .mutation(async ({ input }) => {
      try {
        const { id, discount, name, products } = input;

        await prisma.event.update({
          where: { id },
          data: {
            name,
            discount,
            products: {
              set: [], // Clear existing connections
              connect: products?.map((productId) => ({ id: productId })) || [],
            },
          },
        });

        return handleMutationSuccess("Event Updated!");
      } catch (error) {
        return handleMutationError(error, "Update Event");
      }
    }),

  // Toggle event active status
  toggleActive: baseProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const { id, isActive } = input;

        await prisma.event.update({
          where: { id },
          data: { isActive },
        });

        return handleMutationSuccess(
          `Event ${isActive ? "activated" : "deactivated"} successfully`
        );
      } catch (error) {
        return handleMutationError(error, "Toggle Event Status");
      }
    }),

  // Delete event
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.event.delete({
          where: {
            id: input.id,
          },
        });

        return handleMutationSuccess("Event Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Event");
      }
    }),

  // Delete many events
  deleteMany: baseProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      try {
        await prisma.event.deleteMany({
          where: {
            id: {
              in: input.ids,
            },
          },
        });

        return handleMutationSuccess("Events Deleted");
      } catch (error) {
        return handleMutationError(error, "Delete Events");
      }
    }),

  // Set event dates
  setDates: baseProcedure
    .input(
      z.object({
        id: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, startDate, endDate } = input;

        await prisma.event.update({
          where: { id },
          data: {
            startDate,
            endDate,
          },
        });

        return handleMutationSuccess("Event dates updated");
      } catch (error) {
        return handleMutationError(error, "Update Event Dates");
      }
    }),

  // Add products to event
  addProducts: baseProcedure
    .input(
      z.object({
        id: z.string(),
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, productIds } = input;

        await prisma.event.update({
          where: { id },
          data: {
            products: {
              connect: productIds.map((productId) => ({ id: productId })),
            },
          },
        });

        return handleMutationSuccess("Products added to event");
      } catch (error) {
        return handleMutationError(error, "Add Products to Event");
      }
    }),

  // Remove products from event
  removeProducts: baseProcedure
    .input(
      z.object({
        id: z.string(),
        productIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, productIds } = input;

        await prisma.event.update({
          where: { id },
          data: {
            products: {
              disconnect: productIds.map((productId) => ({ id: productId })),
            },
          },
        });

        return handleMutationSuccess("Products removed from event");
      } catch (error) {
        return handleMutationError(error, "Remove Products from Event");
      }
    }),
});