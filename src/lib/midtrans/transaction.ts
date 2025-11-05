import { TransactionParams } from "@/types";
import { logger } from "../logger";
import snap, { tempSnap } from ".";

export const createTransaction = async (params: TransactionParams) => {
  const res = await snap
    .createTransaction(params)
    .catch((e) => {
      logger.error("Midtrans transaction creation failed", e);
      return undefined;
    });
  return res;
};

export const midtransNotification = async (params: JSON) => {
  const res = await tempSnap.transaction
    .notification(params)
    .catch((e) => {
      logger.error("Midtrans notification processing failed", e);
      return undefined;
    });
  return res;
};
