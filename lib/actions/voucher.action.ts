"use server"

import prisma from "../db/prisma"

export async function getAllVoucher(){
  return await prisma.voucher.findMany()
}

export async function deleteManyVouchers(id: string[]) {
  return await prisma.voucher.deleteMany({
    where: {
      id: {
        in: id
      }
    }
  })
}