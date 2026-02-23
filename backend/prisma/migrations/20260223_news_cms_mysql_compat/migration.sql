-- ============================================
-- Migration: News CMS MySQL-compatible schema
-- Drops old news tables and recreates with BIGINT IDs,
-- integer data_status, and exact column names for MySQL import compatibility.
-- ============================================

-- Drop old tables (order matters due to foreign keys)
DROP TABLE IF EXISTS "news_tag_relations" CASCADE;
DROP TABLE IF EXISTS "news_tags" CASCADE;
DROP TABLE IF EXISTS "news_views" CASCADE;
DROP TABLE IF EXISTS "news_highlights" CASCADE;
DROP TABLE IF EXISTS "news" CASCADE;
DROP TABLE IF EXISTS "news_categories" CASCADE;

-- Drop the ContentStatus enum if only used by news (check before dropping)
-- Note: ContentStatus may still be used by other models, so we don't drop it.

-- ============================================
-- Table 1: news_category
-- ============================================
CREATE TABLE "news_category" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "category_name" VARCHAR(255) NOT NULL,
    "data_order" INTEGER,
    "slug" VARCHAR(255) NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1 CHECK ("data_status" IN (0, 1, 2)),
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ
);

CREATE INDEX "news_category_data_order_idx" ON "news_category"("data_order");

-- ============================================
-- Table 2: news_content
-- ============================================
CREATE TABLE "news_content" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_category" BIGINT,
    "title_en" VARCHAR(255) NOT NULL,
    "title_id" VARCHAR(255),
    "slug" VARCHAR(255) NOT NULL,
    "news_date" DATE NOT NULL,
    "news_thumbnail" VARCHAR(255),
    "excerpt_en" TEXT,
    "excerpt_id" TEXT,
    "content_en" TEXT NOT NULL,
    "content_id" TEXT,
    "news_link" VARCHAR(255),
    "data_status" SMALLINT NOT NULL DEFAULT 1 CHECK ("data_status" IN (0, 1)),
    "view_count" BIGINT NOT NULL DEFAULT 0,
    "view_count_unique" BIGINT NOT NULL DEFAULT 0,
    "custom_css" TEXT,
    "custom_js" TEXT,
    "meta_keyword" TEXT,
    "created_by" VARCHAR(255),
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    CONSTRAINT "news_content_slug_key" UNIQUE ("slug"),
    CONSTRAINT "news_content_id_category_fkey" FOREIGN KEY ("id_category")
        REFERENCES "news_category"("id") ON DELETE SET NULL
);

CREATE INDEX "news_content_id_category_idx" ON "news_content"("id_category");
CREATE INDEX "news_content_news_date_idx" ON "news_content"("news_date");
CREATE INDEX "news_content_data_status_idx" ON "news_content"("data_status");

-- ============================================
-- Table 3: news_highlight
-- ============================================
CREATE TABLE "news_highlight" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "id_news" BIGINT NOT NULL,
    "data_order" INTEGER,
    "created_by" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_by" VARCHAR(255),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "news_highlight_data_order_key" UNIQUE ("data_order"),
    CONSTRAINT "news_highlight_id_news_fkey" FOREIGN KEY ("id_news")
        REFERENCES "news_content"("id") ON DELETE CASCADE
);

CREATE INDEX "news_highlight_id_news_idx" ON "news_highlight"("id_news");

-- ============================================
-- Table 4: news_view
-- ============================================
CREATE TABLE "news_view" (
    "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "media_id" BIGINT,
    "ip_address" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "created_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ,
    CONSTRAINT "news_view_media_id_fkey" FOREIGN KEY ("media_id")
        REFERENCES "news_content"("id") ON DELETE CASCADE
);

CREATE INDEX "news_view_media_id_idx" ON "news_view"("media_id");
CREATE INDEX "news_view_composite_idx" ON "news_view"("media_id", "ip_address", "user_agent");

-- ============================================
-- Seed: Insert Uncategorized category (id=1, data_status=2)
-- ============================================
INSERT INTO "news_category" ("category_name", "data_order", "slug", "data_status", "created_by", "created_at", "updated_at")
VALUES ('Uncategorized', 0, 'uncategorized', 2, 'system@admin.com', NOW(), NOW());
