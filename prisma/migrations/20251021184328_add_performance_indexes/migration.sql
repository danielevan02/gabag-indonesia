-- CreateIndex
-- Add performance indexes for Order table
CREATE INDEX IF NOT EXISTS "idx_order_user_delivery_payment" ON "Order"("userId", "isDelivered", "paymentStatus");
CREATE INDEX IF NOT EXISTS "idx_order_user_created" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_order_delivery_payment" ON "Order"("isDelivered", "paymentStatus");

-- Add performance indexes for Review table
CREATE INDEX IF NOT EXISTS "idx_review_product_created" ON "Review"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_review_user" ON "Review"("userId");
