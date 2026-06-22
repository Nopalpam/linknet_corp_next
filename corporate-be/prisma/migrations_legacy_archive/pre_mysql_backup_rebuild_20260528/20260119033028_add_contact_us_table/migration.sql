/*
  Warnings:

  - The values [TEXT,FILE] on the enum `SettingType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deleted_at` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `menu_type` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `page_components` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `page_components` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `page_components` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `page_components` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `featured_image` on the `pages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by_id` on the `pages` table. All the data in the column will be lost.
  - The `template` column on the `pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `pages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `token` on the `refresh_tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `menus` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_id]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token_hash]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `awards` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `title` on the `menus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `component_data` to the `page_components` table without a default value. This is not possible if the table is not empty.
  - Added the required column `component_type` to the `page_components` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_hash` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Made the column `value` on table `settings` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MenuLinkType" AS ENUM ('INTERNAL', 'EXTERNAL', 'DROPDOWN');

-- CreateEnum
CREATE TYPE "MenuStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PageTemplate" AS ENUM ('DEFAULT', 'FULL_WIDTH', 'LANDING');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('BUSINESS', 'SUPPORT', 'CAREER', 'OTHERS');

-- AlterEnum
BEGIN;
CREATE TYPE "SettingType_new" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'IMAGE', 'SELECT');
ALTER TABLE "settings" ALTER COLUMN "type" TYPE "SettingType_new" USING ("type"::text::"SettingType_new");
ALTER TYPE "SettingType" RENAME TO "SettingType_old";
ALTER TYPE "SettingType_new" RENAME TO "SettingType";
DROP TYPE "SettingType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_updated_by_id_fkey";

-- DropIndex
DROP INDEX "menus_deleted_at_idx";

-- DropIndex
DROP INDEX "menus_is_active_idx";

-- DropIndex
DROP INDEX "menus_menu_type_idx";

-- DropIndex
DROP INDEX "menus_position_idx";

-- DropIndex
DROP INDEX "page_components_position_idx";

-- DropIndex
DROP INDEX "page_components_type_idx";

-- DropIndex
DROP INDEX "refresh_tokens_token_idx";

-- DropIndex
DROP INDEX "refresh_tokens_token_key";

-- AlterTable
ALTER TABLE "awards" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "thumbnails" JSONB;

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "deleted_at",
DROP COLUMN "is_active",
DROP COLUMN "menu_type",
DROP COLUMN "position",
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "page_id" TEXT,
ADD COLUMN     "status" "MenuStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "type" "MenuLinkType" NOT NULL DEFAULT 'INTERNAL',
DROP COLUMN "title",
ADD COLUMN     "title" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "page_components" DROP COLUMN "data",
DROP COLUMN "is_active",
DROP COLUMN "position",
DROP COLUMN "type",
ADD COLUMN     "component_data" JSONB NOT NULL,
ADD COLUMN     "component_type" TEXT NOT NULL,
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "pages" DROP COLUMN "content",
DROP COLUMN "excerpt",
DROP COLUMN "featured_image",
DROP COLUMN "updated_by_id",
ADD COLUMN     "og_image" TEXT,
DROP COLUMN "template",
ADD COLUMN     "template" "PageTemplate" NOT NULL DEFAULT 'DEFAULT',
DROP COLUMN "status",
ADD COLUMN     "status" "PageStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "token",
ADD COLUMN     "token_hash" TEXT NOT NULL,
ADD COLUMN     "token_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "is_system" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "options" JSONB,
ALTER COLUMN "value" SET NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'STRING';

-- DropEnum
DROP TYPE "MenuType";

-- CreateTable
CREATE TABLE "contact_us" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT,
    "company" TEXT,
    "inquiry_type" "InquiryType" NOT NULL,
    "message" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_us_email_idx" ON "contact_us"("email");

-- CreateIndex
CREATE INDEX "contact_us_inquiry_type_idx" ON "contact_us"("inquiry_type");

-- CreateIndex
CREATE INDEX "contact_us_submitted_at_idx" ON "contact_us"("submitted_at");

-- CreateIndex
CREATE INDEX "contact_us_created_at_idx" ON "contact_us"("created_at");

-- CreateIndex
CREATE INDEX "awards_year_idx" ON "awards"("year");

-- CreateIndex
CREATE INDEX "awards_status_idx" ON "awards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "menus_slug_key" ON "menus"("slug");

-- CreateIndex
CREATE INDEX "menus_order_idx" ON "menus"("order");

-- CreateIndex
CREATE INDEX "menus_status_idx" ON "menus"("status");

-- CreateIndex
CREATE INDEX "menus_type_idx" ON "menus"("type");

-- CreateIndex
CREATE INDEX "menus_page_id_idx" ON "menus"("page_id");

-- CreateIndex
CREATE INDEX "page_components_order_idx" ON "page_components"("order");

-- CreateIndex
CREATE INDEX "page_components_component_type_idx" ON "page_components"("component_type");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "pages_template_idx" ON "pages"("template");

-- CreateIndex
CREATE INDEX "pages_created_by_id_idx" ON "pages"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_id_key" ON "refresh_tokens"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_id_idx" ON "refresh_tokens"("token_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "settings_is_public_idx" ON "settings"("is_public");

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
