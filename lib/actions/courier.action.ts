"use server";

import { Areas, Courier, OrderResponse, Rates } from "@/types";
import { getOrderItemByOrderId, updateOrderShipment } from "./order.action";
import { revalidatePath } from "next/cache";
import { ShipmentType } from "@/app/admin/order/components/create-shipment-button";

export async function getAllCouriers() {
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
    console.log(error);
  }
}

type CourierRatesReq = {
  destination_postal_code: string;
  destination_area_id: string;
  items: {
    name: string;
    value: number;
    quantity: number;
    weight: number;
  }[];
};

export async function getCourierRates({
  destination_area_id,
  destination_postal_code,
  items,
}: CourierRatesReq) {
  try {
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
    console.log(error);
  }
}

export async function getMapsId(inputSearch: string) {
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
}

export async function createBiteshipOrder({ courier, orderId, shippingInfo }: ShipmentType) {
  try {
    const courier_company = courier.split("-")[0];
    const courier_type = courier.split("-")[1];
    const items = await getOrderItemByOrderId(orderId);
    console.log(items)
    if (items?.length === 0 || !items) {
      return console.log("There is no Order Item");
    }
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
        items: items.map((item) => ({
          name: item.name,
          value: item.price,
          quantity: item.qty,
          weight: item.weight,
          length: item.length,
          width: item.width,
          height: item.height
        })),
      }),
    });

    const data: OrderResponse = await res.json();
    await updateOrderShipment({
      id: orderId,
      trackingOrder: data.courier.tracking_id,
      deliveredAt: data.delivery.datetime,
    });
    revalidatePath("/admin/order");
  } catch (error) {
    console.log(error);
  }
}
