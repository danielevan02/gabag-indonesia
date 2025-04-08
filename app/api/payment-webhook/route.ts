import { finalizeOrder } from "@/lib/actions/order.action";
import { midtransNotification } from "@/lib/midtrans/transaction";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const notificationJson = await req.json()
  const statusResponse = await midtransNotification(notificationJson);
  const { order_id, transaction_status, fraud_status } = statusResponse;

  console.log(
    `🔔 Notifikasi diterima: Order ID: ${order_id}, Status: ${transaction_status}, Fraud: ${fraud_status}`
  );

  // ✅ Contoh logika update status
  if (transaction_status === "capture" && fraud_status === "accept") {
    await finalizeOrder({orderId: order_id, paymentStatus: transaction_status})
  } else if(transaction_status === 'settlement'){
    await finalizeOrder({orderId: order_id, paymentStatus: transaction_status})
  } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
    await finalizeOrder({orderId: order_id, paymentStatus: transaction_status, isPaid: false})
  } else if (transaction_status === "pending") {
    await finalizeOrder({orderId: order_id, paymentStatus: transaction_status})
  }

  return new NextResponse(JSON.stringify({message: 'OK'}));
}
