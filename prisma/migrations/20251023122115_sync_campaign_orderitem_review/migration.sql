-- AlterTable Campaign: Remove totalStockLimit column
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "totalStockLimit";

-- AlterTable OrderItem: Add campaignId column
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "campaignId" UUID;

-- AddForeignKey for OrderItem.campaignId
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'OrderItem_campaignId_fkey'
    AND table_name = 'OrderItem'
  ) THEN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable Review: Make columns NOT NULL
ALTER TABLE "Review"
  ALTER COLUMN "userId" SET NOT NULL,
  ALTER COLUMN "orderId" SET NOT NULL,
  ALTER COLUMN "isVerifiedPurchase" SET NOT NULL,
  ALTER COLUMN "isVerifiedPurchase" SET DEFAULT false;
