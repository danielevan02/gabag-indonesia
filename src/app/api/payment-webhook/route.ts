import { updatePaymentStatus } from "@/lib/actions/payment.action";
import { midtransNotification } from "@/lib/midtrans/transaction";
import { validateMidtransNotification } from "@/lib/midtrans/verify-signature";
import { rateLimit, getRateLimitIdentifier, RateLimitPresets } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting to prevent abuse
    const identifier = getRateLimitIdentifier(req, "webhook:payment");
    const rateLimitResult = rateLimit({
      identifier,
      ...RateLimitPresets.WEBHOOK,
    });

    if (!rateLimitResult.success) {
      logger.warn("Payment webhook rate limit exceeded");
      return new NextResponse(
        JSON.stringify({ message: "Too many requests" }),
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const notificationJson = await req.json();

    // Verify webhook signature to prevent unauthorized requests
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      logger.error("MIDTRANS_SERVER_KEY not configured");
      return new NextResponse(
        JSON.stringify({ message: 'Server configuration error' }),
        { status: 500 }
      );
    }

    const isValid = validateMidtransNotification(notificationJson, serverKey);
    if (!isValid) {
      logger.error("Payment webhook received invalid signature - potential security threat");
      return new NextResponse(
        JSON.stringify({ message: 'Invalid signature' }),
        { status: 401 }
      );
    }

    const statusResponse = await midtransNotification(notificationJson);

    if (!statusResponse) {
      logger.error("Midtrans notification failed - no response received");
      return new NextResponse(
        JSON.stringify({ message: 'Notification failed' }),
        { status: 400 }
      );
    }

    const { order_id, transaction_status, fraud_status } = statusResponse;

    logger.info("Processing payment webhook", {
      status: transaction_status,
      fraud: fraud_status,
    });

    await updatePaymentStatus({
      orderId: order_id,
      paymentStatus: transaction_status,
    });

    logger.info("Payment status updated successfully", {
      status: transaction_status,
    });

    revalidatePath('/orders');
    return new NextResponse(JSON.stringify({ message: 'OK' }), { status: 200 });
  } catch (error) {
    logger.error("Error processing payment webhook", error);
    return new NextResponse(
      JSON.stringify({ message: 'Error processing webhook' }),
      { status: 500 }
    );
  }
}