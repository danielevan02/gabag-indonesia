/*
  Warnings:

  - You are about to drop the column `productId` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "productId",
ADD COLUMN     "isEventCategory" BOOLEAN NOT NULL DEFAULT false;
