import { updatePaymentStatus } from "@/lib/actions/payment.action";
import { midtransNotification } from "@/lib/midtrans/transaction";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const notificationJson = await req.json()
  const statusResponse = await midtransNotification(notificationJson);
  const { order_id, transaction_status, fraud_status } = statusResponse;

  console.log(
    `🔔 Notifikasi diterima: Order ID: ${order_id}, Status: ${transaction_status}, Fraud: ${fraud_status}`
  );

  await updatePaymentStatus({orderId: order_id, paymentStatus: transaction_status})

  revalidatePath('/orders')
  return new NextResponse(JSON.stringify({message: 'OK'}), {status: 200});
}