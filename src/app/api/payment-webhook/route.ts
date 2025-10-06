import { updatePaymentStatus } from "@/lib/actions/payment.action";
import { midtransNotification } from "@/lib/midtrans/transaction";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const notificationJson = await req.json()
    const statusResponse = await midtransNotification(notificationJson);

    if (!statusResponse) {
      console.error('[PAYMENT WEBHOOK] Midtrans notification failed - no response');
      return new NextResponse(JSON.stringify({message: 'Notification failed'}), {status: 400});
    }

    const { order_id, transaction_status, fraud_status } = statusResponse;

    console.log(
      `[PAYMENT WEBHOOK] Order ID: ${order_id}, Status: ${transaction_status}, Fraud: ${fraud_status}`
    );

    await updatePaymentStatus({orderId: order_id, paymentStatus: transaction_status})

    console.log(`[PAYMENT WEBHOOK] Successfully updated order ${order_id} to status: ${transaction_status}`);

    revalidatePath('/orders')
    return new NextResponse(JSON.stringify({message: 'OK'}), {status: 200});
  } catch (error) {
    console.error('[PAYMENT WEBHOOK] Error processing webhook:', error);
    return new NextResponse(JSON.stringify({message: 'Error processing webhook'}), {status: 500});
  }
}