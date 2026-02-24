-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('RICH_TEXT', 'MARKDOWN', 'PLAIN_TEXT');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "contentType" "ContentType" NOT NULL DEFAULT 'MARKDOWN';
