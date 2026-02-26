-- CreateTable
CREATE TABLE "retention_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Default Policy',
    "deviceLogRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "statusHistoryRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "alertRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "resolvedAlertRetentionDays" INTEGER NOT NULL DEFAULT 7,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastCleanupAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_policies_pkey" PRIMARY KEY ("id")
);
