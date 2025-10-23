'use server'

import { revalidatePath } from "next/cache";
import prisma from "../prisma";

type UpdatePaymentStatus = {
  orderId: string;
  paymentStatus: string;
};

export async function updatePaymentStatus({ orderId, paymentStatus }: UpdatePaymentStatus) {
  try {
    await prisma.$transaction(async (tx) => {
      // Determine payment success/failure
      const isPaymentSuccess = ["capture", "settlement"].includes(paymentStatus);
      const isPaymentFailed = ["expire", "cancel", "deny", "failure"].includes(paymentStatus);

      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus,
          isPaid: isPaymentSuccess,
          paidAt: isPaymentSuccess ? new Date() : (isPaymentFailed ? null : undefined),
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
    console.log(error);
  }
}