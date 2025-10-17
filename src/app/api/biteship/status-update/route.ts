import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Handle GET request for webhook validation
export async function GET() {
  console.log("[BITESHIP WEBHOOK] GET request received for validation");
  return NextResponse.json({ message: "ok", status: "ready" }, { status: 200 });
}

// Biteship Webhook Status Mapping (Official from Biteship Documentation)
const BITESHIP_STATUS_MAPPING = {
  // Confirmed - Order has been confirmed. Locating nearest driver to pick up.
  confirmed: "confirmed",

  // Allocated - Courier has been allocated. Waiting to pick up.
  allocated: "allocated",

  // Picking Up - Courier is on the way to pick up item.
  pickingUp: "picking_up",

  // Picked - Item has been picked and ready to be shipped.
  picked: "picked",

  // Dropping Off - Item is on the way to customer.
  droppingOff: "dropping_off",

  // Delivered - Item has been delivered.
  delivered: "delivered",

  // Return In Transit - Order is on the way back to the origin.
  returnInTransit: "return_in_transit",

  // Returned - Order successfully returned.
  returned: "returned",

  // On Hold - Shipment is on hold at the moment.
  onHold: "on_hold",

  // Rejected - Shipment has been rejected.
  rejected: "rejected",

  // Courier Not Found - Shipment is canceled because there's no courier available.
  courierNotFound: "courier_not_found",

  // Cancelled - Order is cancelled.
  cancelled: "cancelled",

  // Disposed - Order successfully disposed.
  disposed: "disposed",
} as const;

/**
 * Verify Biteship webhook signature for security
 * Optional: Uncomment if Biteship provides signature verification
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function verifyBiteshipSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return hash === signature;
  } catch (error) {
    console.error("[BITESHIP WEBHOOK] Signature verification error:", error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Handle empty body or validation request from Biteship during webhook installation
    if (!rawBody || rawBody.trim() === "" || rawBody === "{}") {
      console.log("[BITESHIP WEBHOOK] Received validation/installation request");
      return NextResponse.json({ message: "ok" }, { status: 200 });
    }

    const webhookData = JSON.parse(rawBody);

    console.log("[BITESHIP WEBHOOK] Received webhook:", JSON.stringify(webhookData, null, 2));

    // Optional: Verify webhook signature
    // Uncomment jika Biteship mengirim signature header
    /*
    const signature = req.headers.get("x-biteship-signature");
    const webhookSecret = process.env.BITESHIP_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const isValid = verifyBiteshipSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("[BITESHIP WEBHOOK] Invalid signature");
        return NextResponse.json(
          { message: "Invalid signature" },
          { status: 401 }
        );
      }
    }
    */

    // Extract data from webhook payload (actual Biteship format)
    const {
      event,                        // Event type (e.g., "order.status")
      order_id,                     // Biteship order ID
      courier_waybill_id,           // Nomor resi
      courier_tracking_id,          // Biteship tracking ID
      status,                       // Status pengiriman
      courier_company,              // Courier company (e.g., "jne")
      courier_type,                 // Courier type (e.g., "reg")
      courier_driver_name,          // Driver name
      courier_driver_phone,         // Driver phone
      courier_driver_plate_number,  // Vehicle plate number
      courier_driver_photo_url,     // Driver photo
      courier_link,                 // Tracking link
      order_price,                  // Order price
      updated_at,                   // Last update timestamp
      external_id,                  // Order ID dari sistem kita (jika dikirim saat create order)
      history,                      // Array history tracking (optional)
    } = webhookData;

    // Validation request without actual order data - respond OK
    if (!order_id && !external_id && !courier_waybill_id && !status) {
      console.log("[BITESHIP WEBHOOK] Validation request without order data");
      return NextResponse.json({ message: "ok" }, { status: 200 });
    }

    if (!order_id && !external_id && !courier_waybill_id) {
      console.error("[BITESHIP WEBHOOK] Missing order identifiers");
      return NextResponse.json(
        { message: "ok" }, // Still return ok to not break webhook
        { status: 200 }
      );
    }

    // Find order by tracking number or external_id
    let order;

    if (external_id) {
      // Jika kita mengirim external_id saat create shipment
      order = await prisma.order.findUnique({
        where: { id: external_id },
      });
    } else if (courier_waybill_id) {
      // Cari berdasarkan nomor resi
      order = await prisma.order.findFirst({
        where: { trackingOrder: courier_waybill_id },
      });
    }

    if (!order) {
      console.error(
        `[BITESHIP WEBHOOK] Order not found for tracking: ${courier_waybill_id || external_id}`
      );
      // Return 200 OK even if order not found to prevent Biteship from retrying
      return NextResponse.json(
        { message: "ok", note: "Order not found in system" },
        { status: 200 }
      );
    }

    console.log(
      `[BITESHIP WEBHOOK] Processing order ${order.id}, Status: ${status}, Waybill: ${courier_waybill_id}`
    );

    // Map Biteship status to our system
    const mappedStatus = BITESHIP_STATUS_MAPPING[status as keyof typeof BITESHIP_STATUS_MAPPING] || status;

    // Update order based on status
    const updateData: any = {};

    // Update tracking number if not set
    if (courier_waybill_id && !order.trackingOrder) {
      updateData.trackingOrder = courier_waybill_id;
    }

    // Handle delivered status
    if (status === "delivered") {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date(updated_at || Date.now());

      console.log(`[BITESHIP WEBHOOK] Order ${order.id} marked as delivered`);
    }

    // Handle cancelled/rejected/courierNotFound status - Reset delivery
    if (status === "cancelled" || status === "rejected" || status === "courierNotFound") {
      updateData.isDelivered = false;
      updateData.deliveredAt = null;

      console.log(`[BITESHIP WEBHOOK] Order ${order.id} shipment ${status}`);
    }

    // Handle returned status - Mark as not delivered
    if (status === "returned") {
      updateData.isDelivered = false;
      updateData.deliveredAt = null;

      console.log(`[BITESHIP WEBHOOK] Order ${order.id} returned to sender`);
    }

    // Handle disposed status
    if (status === "disposed") {
      updateData.isDelivered = false;
      updateData.deliveredAt = null;

      console.log(`[BITESHIP WEBHOOK] Order ${order.id} disposed`);
    }

    // Save shipping status history in shippingInfo JSON field
    const currentShippingInfo = (order.shippingInfo as any) || {};
    const statusHistory = currentShippingInfo.statusHistory || [];

    // Add new status to history
    statusHistory.push({
      status: mappedStatus,
      rawStatus: status,
      timestamp: updated_at || new Date().toISOString(),
      note: history?.[history.length - 1]?.note || `Status updated to ${status}`,
      updated_by: history?.[history.length - 1]?.updated_by || "biteship",
      event: event || "order.status",
    });

    // Build comprehensive shipping info with all courier details
    updateData.shippingInfo = {
      ...currentShippingInfo,
      // Current status
      currentStatus: mappedStatus,
      lastUpdated: updated_at || new Date().toISOString(),

      // Tracking info
      biteshipOrderId: order_id || currentShippingInfo.biteshipOrderId,
      trackingId: courier_tracking_id || currentShippingInfo.trackingId,
      courierWaybillId: courier_waybill_id || currentShippingInfo.courierWaybillId,
      courierLink: courier_link || currentShippingInfo.courierLink,

      // Courier details
      courierCompany: courier_company || currentShippingInfo.courierCompany,
      courierType: courier_type || currentShippingInfo.courierType,

      // Driver details (if available)
      ...(courier_driver_name && {
        driverName: courier_driver_name,
        driverPhone: courier_driver_phone,
        driverPlateNumber: courier_driver_plate_number,
        driverPhotoUrl: courier_driver_photo_url,
      }),

      // Order price from Biteship
      ...(order_price && { biteshipOrderPrice: order_price }),

      // Status history
      statusHistory,
    };

    // Update order in database
    await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    console.log(
      `[BITESHIP WEBHOOK] Successfully updated order ${order.id} to status: ${mappedStatus}`
    );

    // Revalidate relevant paths
    revalidatePath("/admin/order");
    revalidatePath("/orders");
    revalidatePath(`/orders/${order.id}`);

    return NextResponse.json({
      message: "ok",
      data: {
        orderId: order.id,
        status: mappedStatus,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[BITESHIP WEBHOOK] Error processing webhook:", error);

    // Return 200 OK to prevent Biteship from retrying
    // We log the error but acknowledge receipt
    return NextResponse.json(
      {
        message: "ok",
        note: "Error logged but acknowledged",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
