-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'READ');

-- AlterTable
ALTER TABLE "contact_us" ADD COLUMN     "read_at" TIMESTAMP(3),
ADD COLUMN     "status" "ContactStatus" NOT NULL DEFAULT 'NEW';

-- CreateIndex
CREATE INDEX "contact_us_status_idx" ON "contact_us"("status");
