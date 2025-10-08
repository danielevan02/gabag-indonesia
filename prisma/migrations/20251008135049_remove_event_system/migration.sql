-- Remove Event system and migrate to Campaign system

-- Step 1: Remove EVENT from VoucherApplicationType enum
-- First, ensure no vouchers are using EVENT type (should be empty based on user confirmation)
DELETE FROM "Voucher" WHERE "applicationType" = 'EVENT';

-- Remove EVENT value from enum
ALTER TYPE "VoucherApplicationType" RENAME TO "VoucherApplicationType_old";
CREATE TYPE "VoucherApplicationType" AS ENUM ('ALL_PRODUCTS', 'CATEGORY', 'SUBCATEGORY', 'SPECIFIC_PRODUCTS', 'SPECIFIC_VARIANTS');
ALTER TABLE "Voucher" ALTER COLUMN "applicationType" TYPE "VoucherApplicationType" USING "applicationType"::text::"VoucherApplicationType";
DROP TYPE "VoucherApplicationType_old";

-- Step 2: Remove eventId column from Voucher table
ALTER TABLE "Voucher" DROP COLUMN IF EXISTS "eventId";

-- Step 3: Remove eventId column from Product table
ALTER TABLE "Product" DROP COLUMN IF EXISTS "eventId";

-- Step 4: Drop Event table
DROP TABLE IF EXISTS "Event";
