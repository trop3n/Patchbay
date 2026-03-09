-- CreateEnum
CREATE TYPE "LedWallType" AS ENUM ('VIDEO_WALL', 'STRIP_LAYOUT');

-- CreateTable
CREATE TABLE "led_walls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "LedWallType" NOT NULL,
    "data" JSONB NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "systemId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "led_walls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "led_walls" ADD CONSTRAINT "led_walls_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "systems"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "led_walls" ADD CONSTRAINT "led_walls_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
