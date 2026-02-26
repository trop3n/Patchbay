-- CreateEnum
CREATE TYPE "SnmpVersion" AS ENUM ('V1', 'V2C', 'V3');

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "snmpCommunity" TEXT,
ADD COLUMN     "snmpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "snmpLastPolled" TIMESTAMP(3),
ADD COLUMN     "snmpPort" INTEGER NOT NULL DEFAULT 161,
ADD COLUMN     "snmpVersion" "SnmpVersion" DEFAULT 'V2C';
