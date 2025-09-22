import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { Areas, Courier, OrderResponse, Rates } from "@/types";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";

// Courier schemas
const courierRatesSchema = z.object({
  destination_postal_code: z.string(),
  destination_area_id: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      quantity: z.number(),
      weight: z.number(),
    })
  ),
});

const mapsSearchSchema = z.object({
  inputSearch: z.string(),
});

const createShipmentSchema = z.object({
  courier: z.string(),
  orderId: z.string(),
  shippingInfo: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    postal_code: z.string(),
    area_id: z.string(),
  }),
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

export const courierRouter = createTRPCRouter({
  // Get all couriers
  getAllCouriers: baseProcedure.query(async () => {
    try {
      const res = await fetch("https://api.biteship.com/v1/couriers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
        },
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data = await res.json();
      return data.couriers as Courier[];
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to get couriers",
      });
    }
  }),

  // Get courier rates
  getCourierRates: baseProcedure
    .input(courierRatesSchema)
    .query(async ({ input }) => {
      try {
        const { destination_area_id, destination_postal_code, items } = input;

        const res = await fetch("https://api.biteship.com/v1/rates/couriers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
          },
          body: JSON.stringify({
            origin_postal_code: process.env.NEXT_PUBLIC_ORIGIN_POSTAL_CODE,
            destination_area_id,
            destination_postal_code,
            origin_area_id: process.env.NEXT_PUBLIC_ORIGIN_AREA_ID,
            couriers: process.env.NEXT_PUBLIC_COURIERS,
            items,
          }),
        });

        const data = await res.json();
        return data?.pricing as Rates[];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get courier rates",
        });
      }
    }),

  // Get maps/areas by search
  getMapsAreas: baseProcedure
    .input(mapsSearchSchema)
    .query(async ({ input }) => {
      try {
        const { inputSearch } = input;

        const url = new URL("https://api.biteship.com/v1/maps/areas");
        const searchParams = new URLSearchParams({
          countries: "ID",
          input: inputSearch,
          type: "single",
        });

        const newUrl = `${url.origin}${url.pathname}?${searchParams.toString()}`;

        const res = await fetch(newUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
          },
        });

        const data = await res.json();
        return data?.areas as Areas[];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get areas",
        });
      }
    }),

  // Create Biteship order/shipment
  createShipment: baseProcedure
    .input(createShipmentSchema)
    .mutation(async ({ input }) => {
      try {
        const { courier, orderId, shippingInfo } = input;

        const courier_company = courier.split("-")[0];
        const courier_type = courier.split("-")[1];

        // Get order items
        const items = await prisma.orderItem.findMany({
          where: {
            orderId,
          },
        });

        if (items?.length === 0 || !items) {
          return {
            success: false,
            message: "There is no Order Item",
          };
        }

        const serializedItems = serializeType([
          ...items.map((item) => ({
            ...item,
            weight: Number(item.weight),
            length: item.length ? Number(item.length) : null,
            width: item.width ? Number(item.width) : null,
            height: item.height ? Number(item.height) : null,
            price: Number(item.price),
          })),
        ]);

        const res = await fetch("https://api.biteship.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
          },
          body: JSON.stringify({
            origin_contact_name: process.env.NEXT_PUBLIC_APP_NAME,
            origin_contact_phone: process.env.NEXT_PUBLIC_PHONE_NUMBER,
            origin_address: process.env.NEXT_PUBLIC_ADDRESS,
            origin_postal_code: process.env.NEXT_PUBLIC_ORIGIN_POSTAL_CODE,
            origin_area_id: process.env.NEXT_PUBLIC_ORIGIN_AREA_ID,
            destination_contact_name: shippingInfo.name,
            destination_contact_phone: shippingInfo.phone,
            destination_contact_email: shippingInfo.email,
            destination_address: shippingInfo.address,
            destination_postal_code: shippingInfo.postal_code,
            destination_area_id: shippingInfo.area_id,
            courier_company,
            courier_type,
            delivery_type: "now",
            items: serializedItems.map((item) => ({
              name: item.name,
              value: item.price,
              quantity: item.qty,
              weight: item.weight,
              length: item.length,
              width: item.width,
              height: item.height,
            })),
          }),
        });

        const data: OrderResponse = await res.json();

        // Update order with shipment info
        const deliveryDate = new Date(data.delivery.datetime);
        await prisma.order.update({
          where: { id: orderId },
          data: {
            trackingOrder: data.courier.tracking_id,
            deliveredAt: deliveryDate,
            isDelivered: true,
          },
        });

        return {
          success: true,
          message: "Shipment created successfully",
          trackingId: data.courier.tracking_id,
          data,
        };
      } catch (error) {
        return handleMutationError(error, "Create Shipment");
      }
    }),

  // Get shipment tracking info
  getTrackingInfo: baseProcedure
    .input(z.object({ trackingId: z.string() }))
    .query(async ({ input }) => {
      try {
        const { trackingId } = input;

        const res = await fetch(`https://api.biteship.com/v1/trackings/${trackingId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
          },
        });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        const data = await res.json();
        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to get tracking info",
        });
      }
    }),

  // Cancel shipment
  cancelShipment: baseProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { orderId } = input;

        // Get order to find tracking ID
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { trackingOrder: true },
        });

        if (!order?.trackingOrder) {
          return {
            success: false,
            message: "No tracking order found",
          };
        }

        const res = await fetch(`https://api.biteship.com/v1/orders/${order.trackingOrder}/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.TEST_BITESHIP_API_KEY}`,
          },
        });

        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: {
            trackingOrder: null,
            deliveredAt: null,
            isDelivered: false,
          },
        });

        return handleMutationSuccess("Shipment cancelled successfully");
      } catch (error) {
        return handleMutationError(error, "Cancel Shipment");
      }
    }),
});