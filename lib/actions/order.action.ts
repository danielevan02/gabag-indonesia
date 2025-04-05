"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { prisma } from "../db/prisma";
import { formatError } from "../utils";
import { Areas, CartItem, ItemDetail, ShippingInfo } from "@/types";
import { revalidatePath } from "next/cache";
import { createTransaction } from "../midtrans/transaction";

export async function getAllOrders(userId?: string) {
  if (userId) {
    return prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        orderItems: true
      }
    });
  } else {
    return prisma.order.findMany({
      include: {
        orderItems: true
      }
    });
  }
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

export async function makePayment({ email, name, phone, subTotal, userId, orderId, cartItem, shippingPrice, taxPrice }: PaymentProps) {
  if (!userId) throw new Error("You're not authenticated!");
  if (!email) throw new Error("You're not authenticated");
  if (!subTotal || subTotal <= 0) throw new Error("There is no product!");
  if (!phone) throw new Error("Please complete your identity (phone)");
  if (!name) throw new Error("Please complete your identity (name)");

  const item_details = cartItem.map((item)=>({
    id: item.variantId ? item.variantId : item.productId,
    name: item.name,
    price: item.price,
    quantity: item.qty
  })) satisfies ItemDetail[]

  try {
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[name.split(" ").length - 1];
    // const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //     Authorization: `Basic ${process.env.MIDTRANS_AUTH_STRING}`,
    //   },
    //   body: JSON.stringify({
    //     transaction_details: {
    //       order_id: orderId,
    //       gross_amount: totalPrice,
    //     },
    //     customer_details: {
    //       first_name: firstName,
    //       last_name: lastName,
    //       email: email,
    //       phone: phone,
    //     },
    //   }),
    // });
    const res = await createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: subTotal + shippingPrice
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
          quantity: 1
        },
        {
          id: (Date.now()+1).toString(),
          name: "Shipping Price",
          price: shippingPrice,
          quantity: 1
        }
      ]
    }).catch((e) => console.log("MIDTRANS_ERROR_CREATE_TRANSACTION:",e))

    return res
  } catch (error) {
    console.log(formatError(error));
  }
}

type FinalizeOrderType = {
  token: string;
  orderId: string;
  isPaid: boolean;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  paymentStatus: "expired" | "success" | "failed" | "waiting for payment";
  courier: string
  shippingInfo: ShippingInfo
};

export async function finalizeOrder({
  orderId,
  token,
  isPaid,
  itemsPrice,
  shippingPrice,
  taxPrice,
  totalPrice,
  paymentStatus,
  courier,
  shippingInfo
}: FinalizeOrderType) {
  const cart = await getMyCart()
  if(!token)throw new Error("Your payment is not valid!")
  try {
    await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          transactionToken: token,
          isPaid,
          paidAt: isPaid ? new Date() : undefined,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          paymentStatus,
          shippingInfo: shippingInfo,
          courier
        },
      });

      for(const item of cart?.items as CartItem[]){
        await tx.orderItem.create({
          data: {
            orderId,
            ...item
          }
        })
      }

      const orderItem = await tx.orderItem.findMany({where: {orderId}})

      if(updatedOrder.paymentStatus === 'success'){
        for(const item of orderItem){
          if(item.variantId){
            await tx.variant.update({
              where: {id: item.variantId},
              data: {
                stock: {
                  decrement: item.qty
                }
              }
            })
          } else {
            await tx.product.update({
              where: {id: item.productId},
              data: {
                stock: {
                  decrement: item.qty
                }
              }
            })
          }
        }

        await tx.cart.update({
          where: {id: cart?.id},
          data: {
            items: [],
            orderId: null,
            itemsPrice: 0, 
            taxPrice: 0,
            totalPrice: 0,
            weight: 0,
            shippingPrice: 0
          }
        })

      }
    }).catch((e)=>console.log("ERRORNYA DISINI BOSSS",e));
    revalidatePath('/order')
  } catch (error) {
    console.log(formatError(error));
  }
}
