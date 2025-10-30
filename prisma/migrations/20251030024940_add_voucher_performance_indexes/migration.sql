-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_isActive_autoApply_startDate_expires_idx" ON "Voucher"("isActive", "autoApply", "startDate", "expires");
