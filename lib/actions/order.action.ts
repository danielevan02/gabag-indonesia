"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { prisma } from "../db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import { CartItem, ItemDetail, ShippingInfo } from "@/types";
import { revalidatePath } from "next/cache";
import { createTransaction } from "../midtrans/transaction";

export async function getAllOrders(userId?: string) {
  if (userId) {
    return prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    return prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });
  }
}

export async function getOrderById(orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true },
  });

  return convertToPlainObject({
    ...order,
    orderItems: order?.orderItems.map((item) => ({ ...item, weight: Number(item.weight) })),
    shippingInfo: order?.shippingInfo as ShippingInfo,
  });
}

export async function createOrder(notes?: string) {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticate");

    const cart = await getMyCart();
    const userId = session.user?.id;

    if (!userId) throw new Error("User not found");

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "There is no cart or product, please shop first" };
    }

    const newOrderId = await prisma
      .$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            id: `Gbg_Order-${Date.now()}`,
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
    name: item.name,
    price: item.price,
    quantity: item.qty,
  })) satisfies ItemDetail[];

  try {
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[name.split(" ").length - 1];

    const token = await createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: subTotal + shippingPrice,
      },
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
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

    return {
      success: true,
      message: "Payment Successful",
      token: token as string,
    };
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
            paymentStatus: "pending"
          },
          include: {
            orderItems: true
          }
        });

        if (!updatedOrder) throw new Error("There is no order found");

        
        const cart = await getMyCart();
        if (updatedOrder?.orderItems.length === 0) {
          for (const item of cart?.items as CartItem[]) {
            await tx.orderItem.create({
              data: {
                orderId,
                ...item,
              },
            });
          }
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
  orderId: string,
  paymentStatus: string
}

export async function updatePaymentStatus({orderId, paymentStatus}:UpdatePaymentStatus) {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: {id: orderId},
        data: {
          paymentStatus,
          isPaid: ['capture', 'settlement'].includes(paymentStatus),
          paidAt: ['capture', 'settlement'].includes(paymentStatus) ? new Date() : undefined,
        },
        include: {
          orderItems: true
        }
      })

      if (['capture', 'settlement'].includes(paymentStatus)) {
        for (const item of order.orderItems) {
          if (item.variantId) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  decrement: item.qty,
                },
              },
            });
          } else {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.qty,
                },
              },
            });
          }
        }
      }
    })

    revalidatePath('/orders')
  } catch (error) {
    console.log(formatError(error))
  }
}