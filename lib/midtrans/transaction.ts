import { TransactionParams } from "@/types";
import snap from ".";

export const createTransaction = async (params: TransactionParams) => {
    const res = await snap.createTransactionToken(params).catch((e)=> console.log("MIDTRANS_TRANSACTION_ERROR:",e))
    return res
}