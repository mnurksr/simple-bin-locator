-- CreateTable
CREATE TABLE "ProcessedOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderName" TEXT NOT NULL DEFAULT '',
    "webhookId" TEXT NOT NULL,
    "binLocations" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "processedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "metafieldNamespace" TEXT NOT NULL DEFAULT 'warehouse',
    "metafieldKey" TEXT NOT NULL DEFAULT 'bin_location',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notePrefix" TEXT NOT NULL DEFAULT '📦 RAF KONUMLARI:',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedOrder_webhookId_key" ON "ProcessedOrder"("webhookId");

-- CreateIndex
CREATE INDEX "ProcessedOrder_shop_orderId_idx" ON "ProcessedOrder"("shop", "orderId");

-- CreateIndex
CREATE INDEX "ProcessedOrder_webhookId_idx" ON "ProcessedOrder"("webhookId");

-- CreateIndex
CREATE INDEX "ProcessedOrder_shop_createdAt_idx" ON "ProcessedOrder"("shop", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_shop_key" ON "AppSettings"("shop");
