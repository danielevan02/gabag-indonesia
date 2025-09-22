import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "../init";
import { serializeType } from "@/lib/utils";
import z from "zod";

const handleMutationError = (error: unknown, operation: string) => {
  console.error(`${operation} error:`, error);
  return {
    success: false,
    message: `Failed to ${operation}`,
  };
};

const handleMutationSuccess = (message: string) => {
  return {
    success: true,
    message,
  };
};

export const voucherRouter = createTRPCRouter({
  getAll: baseProcedure.query(async () => {
    const data = await prisma.voucher.findMany()

    return serializeType(data)
  }),
  delete: baseProcedure.input(z.object({id: z.string()})).mutation(async ({input}) => {
    try {
      await prisma.voucher.delete({
        where: {
          id: input.id
        }
      })
      return handleMutationSuccess("Voucher Deleted");
    } catch (error) {
      return handleMutationError(error, "Delete Voucher");
    }
  }),
  deleteMany: baseProcedure.input(z.object({ids: z.array(z.string())})).mutation(async ({input}) => {
    try {
      await prisma.voucher.deleteMany({
        where: {
          id: {
            in: input.ids
          }
        }
      })
      return handleMutationSuccess("Vouchers Deleted");
    } catch (error) {
      return handleMutationError(error, "Delete Vouchers");
    }
  })
})