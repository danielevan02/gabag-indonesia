import { TransactionParams } from "@/types";
import snap from ".";

export const createTransaction = async (params: TransactionParams) => {
  const res = await snap
    .createTransactionToken(params)
    .catch((e) => console.log("MIDTRANS_TRANSACTION_ERROR:", e));
  return res;
};

export const midtransNotification = async (params: JSON) => {
  const res = await snap.transaction
    .notification(params)
    .catch((e) => console.log("MIDTRANS_NOTIFICATION_ERROR:", e));
  return res;
};
