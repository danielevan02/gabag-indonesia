-- Remove totalStockLimit from Campaign table
-- This field was redundant as we already have stockLimit per CampaignItem

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "totalStockLimit";
