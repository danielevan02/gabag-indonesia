-- Add product review system with verified purchases
-- This migration adds user tracking and order linking to reviews

-- Step 1: Add new columns to Review table (nullable first for existing data)
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "userId" UUID;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "isVerifiedPurchase" BOOLEAN DEFAULT false;

-- Step 2: Update existing reviews (if any) with placeholder data
-- Set orderId to empty string for existing reviews (they will be considered non-verified)
UPDATE "Review" SET "orderId" = '' WHERE "orderId" IS NULL;

-- Step 3: Add foreign key constraints
-- First, add User relation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Review_userId_fkey'
    ) THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add Order relation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Review_orderId_fkey'
    ) THEN
        ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 4: Add relation to User model (reviews field already exists in schema)
-- This is handled by the foreign key above

-- Step 5: Add relation to Order model (reviews field)
-- This is handled by the foreign key above

-- Step 6: Update Review table to remove old Product cascade delete behavior
-- Drop old foreign key constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'Review_productId_fkey'
        AND confdeltype = 'r' -- RESTRICT
    ) THEN
        ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

        -- Re-add with CASCADE delete
        ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey"
            FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Step 7: Add unique constraint to prevent duplicate reviews per order-product
-- Only add if it doesn't exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Review_orderId_productId_key'
    ) THEN
        -- Delete any potential duplicates first (shouldn't exist, but safety check)
        DELETE FROM "Review" a USING "Review" b
        WHERE a.id > b.id
        AND a."orderId" = b."orderId"
        AND a."productId" = b."productId"
        AND a."orderId" IS NOT NULL
        AND a."orderId" != '';

        -- Add unique constraint
        ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_productId_key"
            UNIQUE ("orderId", "productId");
    END IF;
END $$;

-- Step 8: Make userId and orderId NOT NULL for new records
-- Keep them nullable for backward compatibility with existing data
-- Future inserts will be validated by application layer (tRPC)
