import crypto from "crypto";

/**
 * Verify Midtrans notification signature to ensure webhook authenticity
 * @see https://docs.midtrans.com/reference/notification-http-post#verifying-notification-authenticity
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  // Generate SHA512 hash as per Midtrans specification
  const input = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const hash = crypto.createHash("sha512").update(input).digest("hex");
  return hash;
}

/**
 * Validate incoming webhook notification from Midtrans
 * @param notification - The notification payload from Midtrans
 * @param serverKey - Your Midtrans server key
 * @returns true if signature is valid, false otherwise
 */
export function validateMidtransNotification(
  notification: {
    order_id: string;
    status_code: string;
    gross_amount: string;
    signature_key: string;
  },
  serverKey: string
): boolean {
  const { order_id, status_code, gross_amount, signature_key } = notification;

  if (!order_id || !status_code || !gross_amount || !signature_key) {
    return false;
  }

  const expectedSignature = verifyMidtransSignature(
    order_id,
    status_code,
    gross_amount,
    serverKey
  );

  return signature_key === expectedSignature;
}
