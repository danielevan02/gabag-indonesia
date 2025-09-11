import { TransactionParams } from "@/types";
import snap, { tempSnap } from ".";

export const createTransaction = async (params: TransactionParams) => {
  const res = await snap
    .createTransaction(params)
    .catch((e) => console.log("MIDTRANS_TRANSACTION_ERROR:", e));
  return res;
};

export const midtransNotification = async (params: JSON) => {
  const res = await tempSnap.transaction
    .notification(params)
    .catch((e) => console.log("MIDTRANS_NOTIFICATION_ERROR:", e));
  return res;
};
