/*
  Warnings:

  - The primary key for the `management_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleted_at` on the `management_categories` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `management_categories` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `management_categories` table. All the data in the column will be lost.
  - The `id` column on the `management_categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `name` on the `management_categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to alter the column `slug` on the `management_categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - The primary key for the `managements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deleted_at` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `managements` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `managements` table. All the data in the column will be lost.
  - The `id` column on the `managements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `category_id` column on the `managements` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `name` on the `managements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to alter the column `photo` on the `managements` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(191)`.
  - You are about to drop the column `content` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `featured_image` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `news_categories` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `news_categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `news_categories` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `news_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `news_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `news_highlights` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[news_id]` on the table `news_highlights` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[position]` on the table `news_highlights` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `content_en` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `news_date` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_en` to the `news_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "managements" DROP CONSTRAINT "managements_category_id_fkey";

-- DropIndex
DROP INDEX "management_categories_deleted_at_idx";

-- DropIndex
DROP INDEX "management_categories_is_active_idx";

-- DropIndex
DROP INDEX "management_categories_position_idx";

-- DropIndex
DROP INDEX "managements_deleted_at_idx";

-- DropIndex
DROP INDEX "managements_is_active_idx";

-- DropIndex
DROP INDEX "managements_order_idx";

-- DropIndex
DROP INDEX "managements_slug_idx";

-- DropIndex
DROP INDEX "managements_slug_key";

-- DropIndex
DROP INDEX "news_highlights_is_active_idx";

-- DropIndex
DROP INDEX "news_highlights_start_date_end_date_idx";

-- AlterTable
ALTER TABLE "career_content" ALTER COLUMN "expiry_date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "management_categories" DROP CONSTRAINT "management_categories_pkey",
DROP COLUMN "deleted_at",
DROP COLUMN "is_active",
DROP COLUMN "position",
ADD COLUMN     "created_by" VARCHAR(100),
ADD COLUMN     "order" INTEGER,
ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "updated_by" VARCHAR(100),
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ADD CONSTRAINT "management_categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "managements" DROP CONSTRAINT "managements_pkey",
DROP COLUMN "deleted_at",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "is_active",
DROP COLUMN "linkedin",
DROP COLUMN "order",
DROP COLUMN "phone",
DROP COLUMN "position",
DROP COLUMN "slug",
ADD COLUMN     "bio_en" TEXT,
ADD COLUMN     "bio_id" TEXT,
ADD COLUMN     "category" VARCHAR(100),
ADD COLUMN     "created_by" VARCHAR(100),
ADD COLUMN     "data_order" INTEGER,
ADD COLUMN     "data_status" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "position_en" VARCHAR(191),
ADD COLUMN     "position_id" VARCHAR(191),
ADD COLUMN     "updated_by" VARCHAR(100),
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "category_id",
ADD COLUMN     "category_id" BIGINT,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "photo" SET DATA TYPE VARCHAR(191),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL,
ADD CONSTRAINT "managements_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "news" DROP COLUMN "content",
DROP COLUMN "excerpt",
DROP COLUMN "featured_image",
DROP COLUMN "meta_description",
DROP COLUMN "meta_title",
DROP COLUMN "title",
DROP COLUMN "views",
ADD COLUMN     "content_en" TEXT NOT NULL,
ADD COLUMN     "content_id" TEXT,
ADD COLUMN     "custom_css" TEXT,
ADD COLUMN     "custom_js" TEXT,
ADD COLUMN     "excerpt_en" TEXT,
ADD COLUMN     "excerpt_id" TEXT,
ADD COLUMN     "news_date" DATE NOT NULL,
ADD COLUMN     "news_link" TEXT,
ADD COLUMN     "news_thumbnail" TEXT,
ADD COLUMN     "title_en" TEXT NOT NULL,
ADD COLUMN     "title_id" TEXT,
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "view_count_unique" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "news_categories" DROP COLUMN "color",
DROP COLUMN "icon",
DROP COLUMN "name",
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "name_en" TEXT NOT NULL,
ADD COLUMN     "name_id" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "news_highlights" DROP COLUMN "end_date",
DROP COLUMN "is_active",
DROP COLUMN "start_date",
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "updated_by" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "locked_at" TIMESTAMP(3),
ADD COLUMN     "locked_reason" TEXT,
ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "password_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_views" (
    "id" TEXT NOT NULL,
    "news_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_histories_user_id_idx" ON "password_histories"("user_id");

-- CreateIndex
CREATE INDEX "password_histories_created_at_idx" ON "password_histories"("created_at");

-- CreateIndex
CREATE INDEX "news_views_news_id_idx" ON "news_views"("news_id");

-- CreateIndex
CREATE INDEX "news_views_ip_address_idx" ON "news_views"("ip_address");

-- CreateIndex
CREATE INDEX "management_categories_status_idx" ON "management_categories"("status");

-- CreateIndex
CREATE INDEX "management_categories_order_idx" ON "management_categories"("order");

-- CreateIndex
CREATE INDEX "managements_category_id_idx" ON "managements"("category_id");

-- CreateIndex
CREATE INDEX "managements_data_order_idx" ON "managements"("data_order");

-- CreateIndex
CREATE INDEX "managements_data_status_idx" ON "managements"("data_status");

-- CreateIndex
CREATE INDEX "news_news_date_idx" ON "news"("news_date");

-- CreateIndex
CREATE UNIQUE INDEX "news_highlights_news_id_key" ON "news_highlights"("news_id");

-- CreateIndex
CREATE UNIQUE INDEX "news_highlights_position_key" ON "news_highlights"("position");

-- AddForeignKey
ALTER TABLE "password_histories" ADD CONSTRAINT "password_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_views" ADD CONSTRAINT "news_views_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "news"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "managements" ADD CONSTRAINT "managements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "management_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_career_content_created_at_desc" RENAME TO "career_content_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_career_content_division" RENAME TO "career_content_division_idx";

-- RenameIndex
ALTER INDEX "idx_career_content_expiry_date" RENAME TO "career_content_expiry_date_idx";

-- RenameIndex
ALTER INDEX "idx_career_content_location" RENAME TO "career_content_location_idx";

-- RenameIndex
ALTER INDEX "idx_career_content_status" RENAME TO "career_content_status_idx";

-- RenameIndex
ALTER INDEX "idx_career_content_type" RENAME TO "career_content_type_idx";
