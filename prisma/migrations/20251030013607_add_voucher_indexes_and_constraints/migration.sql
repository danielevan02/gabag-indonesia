-- CreateIndex
CREATE INDEX "Redemption_voucherId_email_idx" ON "Redemption"("voucherId", "email");

-- CreateIndex
CREATE INDEX "Redemption_voucherId_createdAt_idx" ON "Redemption"("voucherId", "createdAt");
