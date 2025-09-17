"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import prisma from "../db/prisma";
import { serializeType, formatError } from "../utils";
import { CartItem, ItemDetail, ShippingInfo } from "@/types";
import { revalidatePath } from "next/cache";
import { createTransaction } from "../midtrans/transaction";
import { redirect } from "next/navigation";

export async function getAllOrders(userId?: string) {
  if (userId) {
    const data = await prisma.order.findMany({
      where: {
        userId,
        paymentStatus: {
          not: "",
        },
      },
      include: {
        orderItems: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return data;
  } else {
    return prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export async function deleteManyOrders(ids: string[]) {
  try {
    return await prisma.order.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  } catch (error) {
    console.log("ERROR_DELETE_MANY_ORDER ", error);
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log("DELETE_ORDER_ERROR:", error);
    return null;
  }
}

export async function getOrderById(orderId: string) {
  // 'use cache'
  // cacheTag('orderById')
  // cacheLife('days')

  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true },
  });

  const convertedData = serializeType(data)

  return {
    ...convertedData,
    shippingInfo: convertedData?.shippingInfo as ShippingInfo,
  };
}

export async function createOrder(notes?: string) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticate");

    const cart = await getMyCart();
    const userId = session.user?.id;

    if (!userId) throw new Error("User not found");
    if (cart?.orderId) return redirect(`/orders/${cart.orderId}`);

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "There is no cart or product, please shop first" };
    }

    const newOrderId = await prisma
      .$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            id: `Gbg_Order-${Date.now()}`,
            notes,
            userId,
          },
        });

        await tx.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            notes,
            orderId: newOrder.id,
          },
        });
        return newOrder.id;
      })
      .catch((e) => console.log(e));

    return newOrderId;
  } catch (error) {
    formatError(error);
  }
}

type PaymentProps = {
  subTotal: number;
  taxPrice: number;
  shippingPrice: number;
  name: string;
  email: string;
  phone: string;
  userId: string;
  orderId: string;
  cartItem: CartItem[];
};

export async function makePayment({
  email,
  name,
  phone,
  subTotal,
  userId,
  orderId,
  cartItem,
  shippingPrice,
  taxPrice,
}: PaymentProps) {
  if (!userId) throw new Error("You're not authenticated!");
  if (!email) throw new Error("You're not authenticated");
  if (!subTotal || subTotal <= 0) throw new Error("There is no product!");
  if (!phone) throw new Error("Please complete your identity (phone)");
  if (!name) throw new Error("Please complete your identity (name)");

  const item_details = cartItem.map((item) => ({
    id: item.variantId ? item.variantId : item.productId,
    name: item.name.slice(0, 40),
    price: item.price,
    quantity: item.qty,
  })) satisfies ItemDetail[];

  try {
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[name.split(" ").length - 1];

    const res = await createTransaction({
      payment_type: "gopay",
      transaction_details: {
        order_id: orderId,
        gross_amount: subTotal + shippingPrice,
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
      },
      item_details: [
        ...item_details,
        {
          id: Date.now().toString(),
          name: "Tax Price",
          price: taxPrice,
          quantity: 1,
        },
        {
          id: (Date.now() + 1).toString(),
          name: "Shipping Price",
          price: shippingPrice,
          quantity: 1,
        },
      ],
    });

    if (res && "token" in res) {
      return {
        success: true,
        message: "Payment Successful",
        token: res.token, // sekarang aman
      };
    }
  } catch (error) {
    console.log(formatError(error));
    return {
      success: false,
      message: "Payment Failed",
      token: "",
    };
  }
}

type FinalizeOrderType = {
  token?: string;
  orderId: string;
  itemsPrice?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice?: number;
  courier?: string;
  shippingInfo?: ShippingInfo;
};

export async function finalizeOrder({
  orderId,
  token,
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
  courier,
  shippingInfo,
}: FinalizeOrderType) {
  if (!token) throw new Error("Your payment is not valid!");
  try {
    await prisma
      .$transaction(async (tx) => {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            transactionToken: token,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            shippingInfo: shippingInfo,
            courier,
            paymentStatus: "pending",
          },
          include: {
            orderItems: true,
          },
        });

        if (!updatedOrder) throw new Error("There is no order found");

        const cart = await getMyCart();

        if (updatedOrder?.orderItems.length === 0) {
          const orderItemsData = (cart?.items as CartItem[]).map((item) => ({
            orderId,
            ...item,
          }));

          await tx.orderItem.createMany({
            data: orderItemsData,
          });
        }

        await tx.cart.update({
          where: { id: cart?.id },
          data: {
            items: [],
            orderId: null,
            itemsPrice: 0,
            taxPrice: 0,
            totalPrice: 0,
            shippingPrice: 0,
          },
        });
      })
      .catch((e) => console.log("ORDER_FINALIZE_ERROR:", e));

    revalidatePath("/orders");

    return {
      success: true,
      message: "Order Updated",
    };
  } catch (error) {
    console.log(formatError(error));
    return {
      success: false,
      message: "Order failed to update",
    };
  }
}

type UpdatePaymentStatus = {
  orderId: string;
  paymentStatus: string;
};

export async function updatePaymentStatus({ orderId, paymentStatus }: UpdatePaymentStatus) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          isPaid: ["capture", "settlement"].includes(paymentStatus),
          paidAt: ["capture", "settlement"].includes(paymentStatus) ? new Date() : undefined,
        },
        include: {
          orderItems: true,
        },
      });

      if (["capture", "settlement"].includes(paymentStatus)) {
        // Group items by variant vs product
        const variantUpdates = order.orderItems
          .filter((item) => item.variantId)
          .map((item) => ({ id: item.variantId, qty: item.qty }));

        const productUpdates = order.orderItems
          .filter((item) => !item.variantId)
          .map((item) => ({ id: item.productId, qty: item.qty }));

        // Update variants in parallel
        const variantPromises = variantUpdates.map((item) =>
          tx.variant.update({
            where: { id: item.id as string },
            data: {
              stock: { decrement: item.qty },
            },
          })
        );

        // Update products in parallel
        const productPromises = productUpdates.map((item) =>
          tx.product.update({
            where: { id: item.id },
            data: {
              stock: { decrement: item.qty },
            },
          })
        );

        // Execute all updates in parallel
        await Promise.all([...variantPromises, ...productPromises]);
      }
    });
    revalidatePath("/orders");
  } catch (error) {
    console.log(formatError(error));
  }
}

export async function getOrderItemByOrderId(orderId: string) {
  try {
    const items = await prisma.orderItem.findMany({
      where: {
        orderId,
      },
    });

    return [
      ...items.map((item) => ({
        ...item,
        weight: Number(item.weight),
        length: item.length ? Number(item.length) : null,
        width: item.width ? Number(item.width) : null,
        height: item.height ? Number(item.height) : null,
        price: Number(item.price),
      })),
    ];
  } catch (error) {
    console.log(formatError(error));
  }
}

export async function updateOrderShipment({
  id,
  deliveredAt,
  trackingOrder,
}: {
  id: string;
  trackingOrder: string;
  deliveredAt: Date;
}) {
  try {
    const deliveryDate = new Date(deliveredAt);
    await prisma.order.update({
      where: { id },
      data: {
        trackingOrder,
        deliveredAt: deliveryDate,
        isDelivered: true,
      },
    });
  } catch (error) {
    console.log(formatError(error));
  }
}
