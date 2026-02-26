-- CreateTable
CREATE TABLE "device_status_history" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL,
    "previousStatus" "DeviceStatus",
    "source" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_status_history_deviceId_recordedAt_idx" ON "device_status_history"("deviceId", "recordedAt");

-- AddForeignKey
ALTER TABLE "device_status_history" ADD CONSTRAINT "device_status_history_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
